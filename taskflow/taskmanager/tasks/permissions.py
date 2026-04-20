def can_delete_comment(user, comment) -> bool:
    return comment.user == user
