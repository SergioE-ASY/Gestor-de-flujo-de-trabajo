from projects.permissions import can_edit_task, can_delete_task


def can_edit_this_task(membership) -> bool:
    return can_edit_task(membership)


def can_delete_this_task(membership) -> bool:
    return can_delete_task(membership)


def can_delete_comment(user, comment) -> bool:
    return comment.user == user


def can_log_time(membership) -> bool:
    return membership is not None and membership.role in ('owner', 'manager', 'developer')


def can_upload_attachment(membership) -> bool:
    return membership is not None and membership.role in ('owner', 'manager', 'developer')
