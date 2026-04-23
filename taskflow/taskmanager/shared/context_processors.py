def sidebar_projects(request):
    if not request.user.is_authenticated:
        return {}
    from projects.models import Project
    projects = (
        Project.objects
        .filter(members__user=request.user, deleted_at__isnull=True)
        .select_related('organization')
        .order_by('organization__name', 'name')
    )
    return {'sidebar_projects': projects}
