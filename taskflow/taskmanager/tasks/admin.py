from django.contrib import admin
from .models import Task, Tag, Comment, Attachment, TimeLog


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'assignee', 'due_date']
    list_filter = ['status', 'priority', 'type']
    search_fields = ['title']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'color']


admin.site.register(Comment)
admin.site.register(Attachment)
admin.site.register(TimeLog)
