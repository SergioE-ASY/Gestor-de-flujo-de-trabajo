from .models import ProjectMember


def get_project_membership(project, user):
    return ProjectMember.objects.filter(project=project, user=user).first()


def can_view_project(membership) -> bool:
    return membership is not None


def can_edit_project(membership) -> bool:
    return membership is not None and membership.role in ('owner', 'manager')


def can_delete_project(membership) -> bool:
    return membership is not None and membership.role == 'owner'


def can_manage_members(membership) -> bool:
    """Owner and manager can add, remove and change member roles."""
    return membership is not None and membership.role in ('owner', 'manager')


def can_manage_sprints(membership) -> bool:
    return membership is not None and membership.role in ('owner', 'manager')


def can_create_task(membership) -> bool:
    return membership is not None and membership.role in ('owner', 'manager', 'developer')


def can_edit_task(membership) -> bool:
    return membership is not None and membership.role in ('owner', 'manager', 'developer')


def can_delete_task(membership) -> bool:
    return membership is not None and membership.role in ('owner', 'manager', 'developer')


def can_manage_tags(membership) -> bool:
    return membership is not None and membership.role in ('owner', 'manager')


def can_update_task_status(membership) -> bool:
    return can_edit_task(membership)


def can_log_time(membership) -> bool:
    return membership is not None and membership.role in ('owner', 'manager', 'developer')


def can_upload_attachment(membership) -> bool:
    return membership is not None and membership.role in ('owner', 'manager', 'developer')
