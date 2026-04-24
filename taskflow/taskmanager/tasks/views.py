from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from projects.models import Project, ProjectMember
from .models import Task, Tag, Comment, Attachment, TimeLog, TaskTag
from .permissions import can_delete_comment
from projects.permissions import (
    can_create_task, can_edit_task, can_delete_task,
    can_update_task_status, can_log_time, can_upload_attachment,
    can_manage_tags,
)
from shared.decorators import require_project_member, project_permission
from decimal import Decimal


def _parse_hours(post):
    """Convert separate h/m POST fields to a Decimal hours value, or None."""
    try:
        h = int(post.get('estimated_h', 0) or 0)
        m = int(post.get('estimated_m', 0) or 0)
        total = Decimal(h) + Decimal(m) / 60
        return total if total > 0 else None
    except (ValueError, TypeError):
        return None


@login_required
@project_permission(can_create_task, pk_kwarg='project_pk')
def task_create(request, project_pk, project=None, membership=None):
    if request.method == 'POST':
        task = Task.objects.create(
            project=project,
            title=request.POST.get('title'),
            description=request.POST.get('description', ''),
            type=request.POST.get('type', 'task'),
            status=request.POST.get('status', 'backlog'),
            priority=request.POST.get('priority', 'medium'),
            start_date=request.POST.get('start_date') or None,
            due_date=request.POST.get('due_date') or None,
            estimated_hours=_parse_hours(request.POST) or None,
            task_responsible_id=request.POST.get('task_responsible') or None,
            sprint_id=request.POST.get('sprint') or None,
            assignee_id=request.POST.get('assignee') or None,
            parent_task_id=request.POST.get('parent_task') or None,
        )
        for tag_id in request.POST.getlist('tags'):
            TaskTag.objects.get_or_create(task=task, tag_id=tag_id)

        from notifications.models import Notification
        if task.assignee and task.assignee != request.user:
            Notification.objects.create(
                user=task.assignee, task=task, project=project,
                type='task_assigned',
                message=f'Se te asignó la tarea: {task.title}',
            )
        if task.task_responsible and task.estimated_hours and task.task_responsible != request.user:
            Notification.objects.create(
                user=task.task_responsible, task=task, project=project,
                type='hours_validation_requested',
                message=f'{request.user.name} solicita que valides la estimación de {task.estimated_hours}h para: {task.title}',
            )

        messages.success(request, f'Tarea "{task.title}" creada.')
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': True, 'task_id': str(task.id)})
        return redirect('task_detail', project_pk=project_pk, pk=task.pk)

    members = project.members.select_related('user')
    sprints = project.sprints.filter(status__in=['planned', 'active'])
    tags = project.tags.all()
    parent_tasks = project.tasks.filter(parent_task__isnull=True).exclude(type='subtask')

    return render(request, 'tasks/task_form.html', {
        'project': project, 'members': members, 'sprints': sprints,
        'tags': tags, 'parent_tasks': parent_tasks,
        'type_choices': Task.TYPE_CHOICES, 'status_choices': Task.STATUS_CHOICES,
        'priority_choices': Task.PRIORITY_CHOICES, 'title': 'Nueva Tarea',
    })


@login_required
@require_project_member(pk_kwarg='project_pk')
def task_detail(request, project_pk, pk, project=None, membership=None):
    task = get_object_or_404(Task, pk=pk, project=project)
    comments = task.comments.filter(deleted_at__isnull=True).select_related('user').all()
    attachments = task.attachments.select_related('uploaded_by').all()
    time_logs = task.time_logs.select_related('user').all()
    subtasks = task.subtasks.select_related('assignee').all()
    total_logged_hours = task.get_total_logged_hours()

    return render(request, 'tasks/task_detail.html', {
        'project': project, 'task': task, 'membership': membership,
        'comments': comments, 'attachments': attachments,
        'time_logs': time_logs, 'subtasks': subtasks,
        'total_logged_hours': total_logged_hours,
        'status_choices': Task.STATUS_CHOICES,
        'priority_choices': Task.PRIORITY_CHOICES,
        'members': project.members.select_related('user'),
        'sprints': project.sprints.filter(status__in=['planned', 'active']),
    })


@login_required
@project_permission(can_edit_task, pk_kwarg='project_pk')
def task_edit(request, project_pk, pk, project=None, membership=None):
    task = get_object_or_404(Task, pk=pk, project=project)

    if request.method == 'POST':
        task.title = request.POST.get('title', task.title)
        task.description = request.POST.get('description', task.description)
        task.type = request.POST.get('type', task.type)
        task.status = request.POST.get('status', task.status)
        task.priority = request.POST.get('priority', task.priority)
        task.start_date = request.POST.get('start_date') or None
        task.due_date = request.POST.get('due_date') or None
        new_hours = _parse_hours(request.POST) or None
        hours_changed = str(new_hours) != str(task.estimated_hours)
        if hours_changed:
            task.hours_validated = False
        task.estimated_hours = new_hours
        old_responsible_id = task.task_responsible_id
        task.task_responsible_id = request.POST.get('task_responsible') or None
        responsible_changed = task.task_responsible_id != old_responsible_id
        task.sprint_id = request.POST.get('sprint') or None
        old_assignee = task.assignee
        task.assignee_id = request.POST.get('assignee') or None
        task.save()

        task.task_tags.all().delete()
        for tag_id in request.POST.getlist('tags'):
            TaskTag.objects.get_or_create(task=task, tag_id=tag_id)

        from notifications.models import Notification
        if task.assignee and task.assignee != old_assignee and task.assignee != request.user:
            Notification.objects.create(
                user=task.assignee, task=task, project=project,
                type='task_assigned',
                message=f'Se te asignó la tarea: {task.title}',
            )
        should_notify_responsible = (
            task.task_responsible and task.estimated_hours
            and task.task_responsible != request.user
            and (responsible_changed or hours_changed)
        )
        if should_notify_responsible:
            Notification.objects.create(
                user=task.task_responsible, task=task, project=project,
                type='hours_validation_requested',
                message=f'{request.user.name} solicita que valides la estimación de {task.estimated_hours}h para: {task.title}',
            )

        messages.success(request, 'Tarea actualizada.')
        return redirect('task_detail', project_pk=project_pk, pk=pk)

    members = project.members.select_related('user')
    sprints = project.sprints.filter(status__in=['planned', 'active'])
    tags = project.tags.all()
    selected_tag_ids = list(task.task_tags.values_list('tag_id', flat=True))

    est = task.estimated_hours or 0
    est_total_min = round(float(est) * 60)
    est_h, est_m = divmod(est_total_min, 60)

    return render(request, 'tasks/task_form.html', {
        'project': project, 'task': task, 'members': members,
        'sprints': sprints, 'tags': tags, 'selected_tag_ids': selected_tag_ids,
        'type_choices': Task.TYPE_CHOICES, 'status_choices': Task.STATUS_CHOICES,
        'priority_choices': Task.PRIORITY_CHOICES, 'title': 'Editar Tarea',
        'est_h': est_h, 'est_m': est_m,
    })


@login_required
@require_POST
@project_permission(can_delete_task, pk_kwarg='project_pk')
def task_delete(request, project_pk, pk, project=None, membership=None):
    task = get_object_or_404(Task, pk=pk, project=project)
    task_title = task.title
    task.delete()
    messages.success(request, f'Tarea "{task_title}" eliminada.')
    return redirect('project_detail', pk=project_pk)


@login_required
@require_POST
@project_permission(can_update_task_status, pk_kwarg='project_pk')
def task_update_status(request, project_pk, pk, project=None, membership=None):
    task = get_object_or_404(Task, pk=pk, project=project)
    new_status = request.POST.get('status')
    if new_status in dict(Task.STATUS_CHOICES):
        task.status = new_status
        task.save()
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({'success': True, 'status': task.status})
    return redirect('task_detail', project_pk=project_pk, pk=pk)


@login_required
@require_POST
@require_project_member(pk_kwarg='project_pk')
def comment_create(request, project_pk, task_pk, project=None, membership=None):
    task = get_object_or_404(Task, pk=task_pk, project=project)
    content = request.POST.get('content', '').strip()
    if content:
        Comment.objects.create(task=task, user=request.user, content=content)
        from notifications.models import Notification
        if task.assignee and task.assignee != request.user:
            Notification.objects.create(
                user=task.assignee, task=task, project=project,
                type='comment_added',
                message=f'{request.user.name} comentó en: {task.title}',
            )
    return redirect('task_detail', project_pk=project_pk, pk=task_pk)


@login_required
@require_POST
@require_project_member(pk_kwarg='project_pk')
def comment_delete(request, project_pk, task_pk, pk, project=None, membership=None):
    comment = get_object_or_404(Comment, pk=pk, task__project=project)
    if not can_delete_comment(request.user, comment):
        messages.error(request, 'Solo puedes eliminar tus propios comentarios.')
        return redirect('task_detail', project_pk=project_pk, pk=task_pk)
    comment.deleted_at = timezone.now()
    comment.save()
    return redirect('task_detail', project_pk=project_pk, pk=task_pk)


@login_required
@require_POST
@project_permission(can_upload_attachment, pk_kwarg='project_pk')
def attachment_upload(request, project_pk, task_pk, project=None, membership=None):
    task = get_object_or_404(Task, pk=task_pk, project=project)
    file = request.FILES.get('file')
    if file:
        Attachment.objects.create(task=task, uploaded_by=request.user, file=file)
        messages.success(request, 'Archivo adjunto subido.')
    return redirect('task_detail', project_pk=project_pk, pk=task_pk)


@login_required
@require_POST
@project_permission(can_log_time, pk_kwarg='project_pk')
def timelog_create(request, project_pk, task_pk, project=None, membership=None):
    from decimal import Decimal, InvalidOperation
    task = get_object_or_404(Task, pk=task_pk, project=project)
    try:
        h = int(request.POST.get('hours_h', 0) or 0)
        m = int(request.POST.get('hours_m', 0) or 0)
        hours = Decimal(h) + Decimal(m) / 60
        if hours <= 0:
            raise ValueError
    except (InvalidOperation, ValueError, TypeError):
        messages.error(request, 'Introduce un tiempo válido.')
        return redirect('task_detail', project_pk=project_pk, pk=task_pk)

    from django.db.models import Sum
    hours_before = task.time_logs.aggregate(total=Sum('hours'))['total'] or 0

    TimeLog.objects.create(
        task=task, project=project, user=request.user,
        hours=hours,
        note=request.POST.get('note', ''),
        logged_date=request.POST.get('logged_date') or timezone.now().date(),
    )
    display = f'{h}h {m}min' if m else f'{h}h'
    messages.success(request, f'{display} registradas correctamente.')

    # Alert managers only on the first crossing of the estimated budget
    if task.estimated_hours and task.hours_validated:
        hours_after = hours_before + hours
        if hours_before < task.estimated_hours <= hours_after:
            from notifications.models import Notification
            from projects.models import ProjectMember
            managers = ProjectMember.objects.filter(
                project=project, role__in=('owner', 'manager')
            ).select_related('user').exclude(user=request.user)
            total_logged = hours_after
            for pm in managers:
                Notification.objects.create(
                    user=pm.user,
                    task=task,
                    project=project,
                    type='hours_exceeded',
                    message=(
                        f'⚠️ La tarea "{task.title}" ha superado su estimación: '
                        f'{total_logged}h registradas de {task.estimated_hours}h estimadas.'
                    ),
                )

    return redirect('task_detail', project_pk=project_pk, pk=task_pk)


@login_required
@require_POST
@require_project_member(pk_kwarg='project_pk')
def task_validate_hours(request, project_pk, pk, project=None, membership=None):
    task = get_object_or_404(Task, pk=pk, project=project)
    if request.user != task.task_responsible:
        messages.error(request, 'Solo el responsable de horas puede validar la estimación.')
        return redirect('task_detail', project_pk=project_pk, pk=pk)
    from notifications.models import Notification
    action = request.POST.get('action')
    notify_user = task.assignee if task.assignee and task.assignee != request.user else None

    if action == 'validate':
        task.hours_validated = True
        task.save(update_fields=['hours_validated'])
        messages.success(request, 'Estimación de horas validada.')
        if notify_user:
            Notification.objects.create(
                user=notify_user, task=task, project=project,
                type='hours_validation_requested',
                message=f'{request.user.name} ha aprobado la estimación de {task.estimated_hours}h para: {task.title}',
            )
    elif action == 'reject':
        hours_before = task.estimated_hours
        task.hours_validated = False
        task.estimated_hours = None
        task.save(update_fields=['hours_validated', 'estimated_hours'])
        messages.info(request, 'Estimación rechazada. El creador puede introducir una nueva.')
        if notify_user:
            Notification.objects.create(
                user=notify_user, task=task, project=project,
                type='hours_validation_requested',
                message=f'{request.user.name} ha rechazado la estimación de {hours_before}h para: {task.title}. Por favor, introduce una nueva estimación.',
            )
    return redirect('task_detail', project_pk=project_pk, pk=pk)


@login_required
@project_permission(can_manage_tags, pk_kwarg='project_pk')
def tag_create(request, project_pk, project=None, membership=None):
    if request.method == 'POST':
        name = request.POST.get('name', '').strip()
        color = request.POST.get('color', '#6366f1')
        if name:
            Tag.objects.get_or_create(project=project, name=name, defaults={'color': color})
            messages.success(request, f'Etiqueta "{name}" creada.')
    return redirect('project_detail', pk=project_pk)


@login_required
def my_tasks(request):
    tasks = Task.objects.filter(assignee=request.user).select_related(
        'project', 'sprint'
    ).order_by('due_date', '-priority')
    status_filter = request.GET.get('status', '')
    if status_filter:
        tasks = tasks.filter(status=status_filter)
    return render(request, 'tasks/my_tasks.html', {
        'tasks': tasks,
        'status_choices': Task.STATUS_CHOICES,
        'selected_status': status_filter,
    })
