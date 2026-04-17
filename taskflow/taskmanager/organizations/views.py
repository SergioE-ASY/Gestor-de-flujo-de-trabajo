from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import get_user_model
from .models import Organization, OrganizationUser
from projects.models import Project

User = get_user_model()


@login_required
def dashboard(request):
    user_orgs = OrganizationUser.objects.filter(user=request.user).select_related('organization')
    
    # Get user's projects across all orgs
    user_projects = Project.objects.filter(
        members__user=request.user, deleted_at__isnull=True
    ).select_related('organization', 'owner').distinct()[:6]

    # Stats
    from tasks.models import Task
    from django.utils import timezone
    my_tasks = Task.objects.filter(assignee=request.user).exclude(status='done')
    overdue_tasks = my_tasks.filter(due_date__lt=timezone.now().date())

    context = {
        'user_orgs': user_orgs,
        'user_projects': user_projects,
        'my_tasks_count': my_tasks.count(),
        'overdue_count': overdue_tasks.count(),
    }
    return render(request, 'organizations/dashboard.html', context)


@login_required
def org_list(request):
    memberships = OrganizationUser.objects.filter(user=request.user).select_related('organization')
    return render(request, 'organizations/org_list.html', {'memberships': memberships})


@login_required
def org_create(request):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        if not name:
            messages.error(request, 'El nombre es obligatorio.')
        else:
            org = Organization.objects.create(
                name=name,
                logo=request.FILES.get('logo'),
                crm_company_id=request.POST.get('crm_company_id', ''),
            )
            OrganizationUser.objects.create(organization=org, user=request.user, role='owner')
            messages.success(request, f'Organización "{org.name}" creada.')
            return redirect('org_detail', pk=org.pk)
    return render(request, 'organizations/org_form.html', {'title': 'Nueva Organización'})


@login_required
def org_detail(request, pk):
    org = get_object_or_404(Organization, pk=pk)
    membership = get_object_or_404(OrganizationUser, organization=org, user=request.user)
    members = org.get_active_members()
    projects = Project.objects.filter(organization=org, deleted_at__isnull=True).select_related('owner')
    
    context = {
        'org': org,
        'membership': membership,
        'members': members,
        'projects': projects,
    }
    return render(request, 'organizations/org_detail.html', context)


@login_required
def org_invite(request, pk):
    org = get_object_or_404(Organization, pk=pk)
    membership = get_object_or_404(OrganizationUser, organization=org, user=request.user)
    
    if membership.role not in ('owner', 'admin'):
        messages.error(request, 'No tienes permisos para invitar miembros.')
        return redirect('org_detail', pk=pk)
    
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        role = request.POST.get('role', 'member')
        try:
            user = User.objects.get(email=email)
            _, created = OrganizationUser.objects.get_or_create(
                organization=org, user=user,
                defaults={'role': role}
            )
            if created:
                messages.success(request, f'{user.name} añadido/a a la organización.')
            else:
                messages.warning(request, f'{user.name} ya es miembro.')
        except User.DoesNotExist:
            messages.error(request, f'No se encontró usuario con email {email}.')
        return redirect('org_detail', pk=pk)

    return redirect('org_detail', pk=pk)


@login_required
def org_member_remove(request, pk, member_pk):
    org = get_object_or_404(Organization, pk=pk)
    membership = get_object_or_404(OrganizationUser, organization=org, user=request.user)
    if membership.role not in ('owner', 'admin'):
        messages.error(request, 'No tienes permisos para eliminar miembros.')
        return redirect('org_detail', pk=pk)
    member = get_object_or_404(OrganizationUser, pk=member_pk, organization=org)
    if request.method == 'POST' and member.user != request.user:
        name = member.user.name
        member.delete()
        messages.success(request, f'{name} eliminado de la organización.')
    return redirect('org_detail', pk=pk)


@login_required
def org_member_update(request, pk, member_pk):
    org = get_object_or_404(Organization, pk=pk)
    membership = get_object_or_404(OrganizationUser, organization=org, user=request.user)
    if membership.role not in ('owner', 'admin'):
        messages.error(request, 'No tienes permisos para editar roles.')
        return redirect('org_detail', pk=pk)
    member = get_object_or_404(OrganizationUser, pk=member_pk, organization=org)
    if request.method == 'POST':
        role = request.POST.get('role')
        if role in ('member', 'admin', 'owner'):
            member.role = role
            member.save()
            messages.success(request, f'Rol de {member.user.name} actualizado.')
    return redirect('org_detail', pk=pk)
