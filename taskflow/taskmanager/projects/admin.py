from django.contrib import admin
from .models import Project, ProjectMember, Sprint


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'key', 'organization', 'status', 'priority', 'owner']
    list_filter = ['status', 'priority']
    search_fields = ['name', 'key']


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'role', 'joined_at']


@admin.register(Sprint)
class SprintAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'status', 'start_date', 'end_date']
    list_filter = ['status']
