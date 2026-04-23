from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.utils import timezone
from .models import Project, ProjectMember, Sprint
from .permissions import (
    can_edit_project, can_delete_project,
    can_manage_members, can_manage_sprints,
    can_manage_tags,
)
from shared.decorators import require_project_member, project_permission
from organizations.models import Organization, OrganizationUser

User = get_user_model()


@login_required
def project_create(request):
    user_orgs = OrganizationUser.objects.filter(user=request.user).select_related('organization')

    if request.method == 'POST':
        org_id = request.POST.get('organization')
        name = request.POST.get('name', '').strip()
        key = request.POST.get('key', '').strip().upper()
        description = request.POST.get('description', '')
        status = request.POST.get('status', 'planning')
        priority = request.POST.get('priority', 'medium')
        start_date = request.POST.get('start_date') or None
        due_date = request.POST.get('due_date') or None

        if not all([org_id, name, key]):
            messages.error(request, 'Organización, nombre y clave son obligatorios.')
        else:
            org = get_object_or_404(Organization, pk=org_id)
            if not OrganizationUser.objects.filter(organization=org, user=request.user).exists():
                messages.error(request, 'No eres miembro de esa organización.')
            elif Project.objects.filter(organization=org, key=key).exists():
                messages.error(request, f'La clave "{key}" ya existe en esta organización.')
            else:
                project = Project.objects.create(
                    organization=org, owner=request.user, key=key,
                    name=name, description=description, status=status,
                    priority=priority, start_date=start_date, due_date=due_date,
                    hour_budget=request.POST.get('hour_budget') or None,
                )
                ProjectMember.objects.create(project=project, user=request.user, role='owner')
                messages.success(request, f'Proyecto "{project.name}" creado.')
                return redirect('project_detail', pk=project.pk)

    return render(request, 'projects/project_form.html', {
        'title': 'Nuevo Proyecto',
        'user_orgs': user_orgs,
        'status_choices': Project.STATUS_CHOICES,
        'priority_choices': Project.PRIORITY_CHOICES,
    })


@login_required
@require_project_member()
def project_detail(request, pk, project=None, membership=None):
    sprints = project.sprints.all().order_by('-start_date')
    members = project.members.select_related('user').all()
    tags = project.tags.all()
    stats = project.get_task_stats()
    hour_stats = project.get_hour_stats()

    from tasks.models import Task
    from tasks.models import TimeLog
    from django.db.models import Sum

    tasks_by_status = {}
    for status_key, status_label in Task.STATUS_CHOICES:
        tasks_by_status[status_key] = {
            'label': status_label,
            'tasks': project.tasks.filter(status=status_key, parent_task__isnull=True)
                          .select_related('assignee', 'sprint').prefetch_related('tags').order_by('position'),
        }

    hours_by_task = (
        TimeLog.objects
        .filter(project=project)
        .values('task__id', 'task__title', 'task__project_sequence', 'task__status', 'task__estimated_hours')
        .annotate(logged=Sum('hours'))
        .order_by('-logged')
    )

    hours_by_member = (
        TimeLog.objects
        .filter(project=project)
        .values('user__id', 'user__name', 'user__avatar')
        .annotate(logged=Sum('hours'))
        .order_by('-logged')
    )

    return render(request, 'projects/project_detail.html', {
        'project': project,
        'membership': membership,
        'sprints': sprints,
        'members': members,
        'tags': tags,
        'stats': stats,
        'hour_stats': hour_stats,
        'hours_by_task': hours_by_task,
        'hours_by_member': hours_by_member,
        'tasks_by_status': tasks_by_status,
        'active_sprint': sprints.filter(status='active').first(),
    })


@login_required
@project_permission(can_edit_project)
def project_edit(request, pk, project=None, membership=None):
    if request.method == 'POST':
        project.name = request.POST.get('name', project.name)
        project.description = request.POST.get('description', project.description)
        project.status = request.POST.get('status', project.status)
        project.priority = request.POST.get('priority', project.priority)
        project.start_date = request.POST.get('start_date') or None
        project.due_date = request.POST.get('due_date') or None
        project.hour_budget = request.POST.get('hour_budget') or None
        project.save()
        messages.success(request, 'Proyecto actualizado.')
        return redirect('project_detail', pk=pk)

    return render(request, 'projects/project_form.html', {
        'title': 'Editar Proyecto',
        'project': project,
        'status_choices': Project.STATUS_CHOICES,
        'priority_choices': Project.PRIORITY_CHOICES,
    })


@login_required
@project_permission(can_delete_project)
def project_delete(request, pk, project=None, membership=None):
    if request.method == 'POST':
        project.soft_delete()
        messages.success(request, f'Proyecto "{project.name}" eliminado.')
        return redirect('dashboard')
    return render(request, 'projects/project_confirm_delete.html', {'project': project})


@login_required
@project_permission(can_manage_members)
def project_add_member(request, pk, project=None, membership=None):
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        role = request.POST.get('role', 'developer')
        try:
            user = User.objects.get(email=email)
            _, created = ProjectMember.objects.get_or_create(
                project=project, user=user, defaults={'role': role}
            )
            if created:
                messages.success(request, f'{user.name} añadido al proyecto.')
            else:
                messages.warning(request, f'{user.name} ya es miembro.')
        except User.DoesNotExist:
            messages.error(request, 'Usuario no encontrado.')
    return redirect('project_detail', pk=pk)


@login_required
@project_permission(can_manage_members)
def project_member_update(request, pk, member_pk, project=None, membership=None):
    member = get_object_or_404(ProjectMember, pk=member_pk, project=project)
    if request.method == 'POST':
        role = request.POST.get('role')
        if role in ('owner', 'manager', 'developer', 'viewer'):
            member.role = role
            member.save()
            messages.success(request, f'Rol de {member.user.name} actualizado.')
    return redirect('project_detail', pk=pk)


@login_required
@project_permission(can_manage_members)
def project_member_remove(request, pk, member_pk, project=None, membership=None):
    member = get_object_or_404(ProjectMember, pk=member_pk, project=project)
    if request.method == 'POST' and member.user != request.user:
        name = member.user.name
        member.delete()
        messages.success(request, f'{name} eliminado del proyecto.')
    return redirect('project_detail', pk=pk)


@login_required
@project_permission(can_manage_members, pk_kwarg='pk')
def member_hour_history(request, pk, user_pk, project=None, membership=None):
    from tasks.models import TimeLog
    from django.db.models import Sum

    target_user = get_object_or_404(User, pk=user_pk)
    if not ProjectMember.objects.filter(project=project, user=target_user).exists():
        messages.error(request, 'Este usuario no es miembro del proyecto.')
        return redirect('project_detail', pk=pk)

    logs = (
        TimeLog.objects
        .filter(project=project, user=target_user)
        .select_related('task')
        .order_by('-logged_date', '-task__project_sequence')
    )

    by_task = (
        TimeLog.objects
        .filter(project=project, user=target_user)
        .values('task__id', 'task__title', 'task__project_sequence', 'task__status')
        .annotate(total=Sum('hours'))
        .order_by('-total')
    )

    total_hours = logs.aggregate(total=Sum('hours'))['total'] or 0

    return render(request, 'projects/member_hour_history.html', {
        'project': project,
        'membership': membership,
        'target_user': target_user,
        'logs': logs,
        'by_task': by_task,
        'total_hours': total_hours,
    })


@login_required
@project_permission(can_manage_sprints)
def sprint_create(request, pk, project=None, membership=None):
    if request.method == 'POST':
        Sprint.objects.create(
            project=project,
            name=request.POST.get('name'),
            goal=request.POST.get('goal', ''),
            status=request.POST.get('status', 'planned'),
            start_date=request.POST.get('start_date') or None,
            end_date=request.POST.get('end_date') or None,
        )
        messages.success(request, 'Sprint creado.')
    return redirect('project_detail', pk=pk)


@login_required
@project_permission(can_manage_sprints)
def sprint_update(request, pk, sprint_pk, project=None, membership=None):
    sprint = get_object_or_404(Sprint, pk=sprint_pk, project=project)
    if request.method == 'POST':
        sprint.name = request.POST.get('name', sprint.name)
        sprint.goal = request.POST.get('goal', sprint.goal)
        sprint.status = request.POST.get('status', sprint.status)
        sprint.start_date = request.POST.get('start_date') or sprint.start_date
        sprint.end_date = request.POST.get('end_date') or sprint.end_date
        sprint.save()
        messages.success(request, 'Sprint actualizado.')
    return redirect('project_detail', pk=pk)
