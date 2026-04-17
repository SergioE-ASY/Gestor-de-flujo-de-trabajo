import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class Project(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planificación'),
        ('active', 'Activo'),
        ('on_hold', 'En pausa'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
        ('critical', 'Crítica'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey('organizations.Organization', on_delete=models.CASCADE, related_name='projects')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='owned_projects')
    key = models.CharField(max_length=10, help_text='Clave corta del proyecto, ej: TM')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'project'
        verbose_name = 'Proyecto'
        verbose_name_plural = 'Proyectos'
        unique_together = ('organization', 'key')
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.key}] {self.name}'

    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])

    def get_task_stats(self):
        tasks = self.tasks.all()
        total = tasks.count()
        done = tasks.filter(status='done').count()
        return {
            'total': total,
            'done': done,
            'progress': round((done / total * 100) if total > 0 else 0),
        }


class ProjectMember(models.Model):
    ROLE_CHOICES = [
        ('owner', 'Propietario'),
        ('manager', 'Manager'),
        ('developer', 'Desarrollador'),
        ('viewer', 'Observador'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='developer')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'project_member'
        unique_together = ('project', 'user')
        verbose_name = 'Miembro del proyecto'
        verbose_name_plural = 'Miembros del proyecto'

    def __str__(self):
        return f'{self.user.name} → {self.project.name}'


class Sprint(models.Model):
    STATUS_CHOICES = [
        ('planned', 'Planificado'),
        ('active', 'Activo'),
        ('completed', 'Completado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='sprints')
    name = models.CharField(max_length=200)
    goal = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'sprint'
        verbose_name = 'Sprint'
        verbose_name_plural = 'Sprints'
        ordering = ['-start_date']

    def __str__(self):
        return f'{self.project.key} — {self.name}'
