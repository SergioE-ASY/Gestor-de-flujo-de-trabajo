from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from projects.models import Project, ProjectMember
from .models import Task, Tag, Comment, Attachment, TimeLog, TaskTag
from .permissions import (
    can_edit_this_task, can_delete_this_task,
    can_delete_comment, can_log_time, can_upload_attachment,
)
from shared.decorators import require_project_member, project_permission


@login_required
@require_project_member(pk_kwarg='project_pk')
def task_create(request, project_pk, project=None, membership=None):
    if request.method == 'POST':
        task = Task.objects.create(
            project=project,
            title=request.POST.get('title'),
            description=request.POST.get('description', ''),
            type=request.POST.get('type', 'task'),
            status=request.POST.get('status', 'backlog'),
            priority=request.POST.get('priority', 'medium'),
            due_date=request.POST.get('due_date') or None,
            estimated_min=request.POST.get('estimated_min') or None,
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
    comments = task.comments.select_related('user').all()
    attachments = task.attachments.select_related('uploaded_by').all()
    time_logs = task.time_logs.select_related('user').all()
    subtasks = task.subtasks.select_related('assignee').all()
    total_logged = task.get_total_logged_minutes()

    return render(request, 'tasks/task_detail.html', {
        'project': project, 'task': task, 'membership': membership,
        'comments': comments, 'attachments': attachments,
        'time_logs': time_logs, 'subtasks': subtasks,
        'total_logged': total_logged,
        'total_logged_display': f'{total_logged // 60}h {total_logged % 60}m' if total_logged else '0m',
        'status_choices': Task.STATUS_CHOICES,
        'priority_choices': Task.PRIORITY_CHOICES,
        'members': project.members.select_related('user'),
        'sprints': project.sprints.filter(status__in=['planned', 'active']),
    })


@login_required
@require_project_member(pk_kwarg='project_pk')
def task_edit(request, project_pk, pk, project=None, membership=None):
    task = get_object_or_404(Task, pk=pk, project=project)

    if not can_edit_this_task(membership):
        messages.error(request, 'Sin permisos para editar tareas.')
        return redirect('task_detail', project_pk=project_pk, pk=pk)

    if request.method == 'POST':
        task.title = request.POST.get('title', task.title)
        task.description = request.POST.get('description', task.description)
        task.type = request.POST.get('type', task.type)
        task.status = request.POST.get('status', task.status)
        task.priority = request.POST.get('priority', task.priority)
        task.due_date = request.POST.get('due_date') or None
        task.estimated_min = request.POST.get('estimated_min') or None
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

        messages.success(request, 'Tarea actualizada.')
        return redirect('task_detail', project_pk=project_pk, pk=pk)

    members = project.members.select_related('user')
    sprints = project.sprints.filter(status__in=['planned', 'active'])
    tags = project.tags.all()
    selected_tag_ids = list(task.task_tags.values_list('tag_id', flat=True))

    return render(request, 'tasks/task_form.html', {
        'project': project, 'task': task, 'members': members,
        'sprints': sprints, 'tags': tags, 'selected_tag_ids': selected_tag_ids,
        'type_choices': Task.TYPE_CHOICES, 'status_choices': Task.STATUS_CHOICES,
        'priority_choices': Task.PRIORITY_CHOICES, 'title': 'Editar Tarea',
    })


@login_required
@require_POST
@require_project_member(pk_kwarg='project_pk')
def task_delete(request, project_pk, pk, project=None, membership=None):
    if not can_delete_this_task(membership):
        messages.error(request, 'Sin permisos para eliminar tareas.')
        return redirect('task_detail', project_pk=project_pk, pk=pk)
    task = get_object_or_404(Task, pk=pk, project=project)
    task_title = task.title
    task.delete()
    messages.success(request, f'Tarea "{task_title}" eliminada.')
    return redirect('project_detail', pk=project_pk)


@login_required
@require_POST
@require_project_member(pk_kwarg='project_pk')
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
    comment.delete()
    return redirect('task_detail', project_pk=project_pk, pk=task_pk)


@login_required
@require_POST
@require_project_member(pk_kwarg='project_pk')
def attachment_upload(request, project_pk, task_pk, project=None, membership=None):
    if not can_upload_attachment(membership):
        messages.error(request, 'Sin permisos para subir archivos.')
        return redirect('task_detail', project_pk=project_pk, pk=task_pk)
    task = get_object_or_404(Task, pk=task_pk, project=project)
    file = request.FILES.get('file')
    if file:
        Attachment.objects.create(task=task, uploaded_by=request.user, file=file)
        messages.success(request, 'Archivo adjunto subido.')
    return redirect('task_detail', project_pk=project_pk, pk=task_pk)


@login_required
@require_POST
@require_project_member(pk_kwarg='project_pk')
def timelog_create(request, project_pk, task_pk, project=None, membership=None):
    if not can_log_time(membership):
        messages.error(request, 'Sin permisos para registrar tiempo.')
        return redirect('task_detail', project_pk=project_pk, pk=task_pk)
    task = get_object_or_404(Task, pk=task_pk, project=project)
    minutes = request.POST.get('minutes')
    if minutes and int(minutes) > 0:
        TimeLog.objects.create(
            task=task, user=request.user,
            minutes=int(minutes),
            note=request.POST.get('note', ''),
            logged_date=request.POST.get('logged_date') or timezone.now().date(),
        )
        messages.success(request, 'Tiempo registrado.')
    return redirect('task_detail', project_pk=project_pk, pk=task_pk)


@login_required
@require_project_member(pk_kwarg='project_pk')
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
