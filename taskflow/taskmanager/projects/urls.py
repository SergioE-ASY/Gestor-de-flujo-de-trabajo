from django.urls import path
from . import views

urlpatterns = [
    path('projects/new/', views.project_create, name='project_create'),
    path('projects/<uuid:pk>/', views.project_detail, name='project_detail'),
    path('projects/<uuid:pk>/edit/', views.project_edit, name='project_edit'),
    path('projects/<uuid:pk>/delete/', views.project_delete, name='project_delete'),
    path('projects/<uuid:pk>/members/add/', views.project_add_member, name='project_add_member'),
    path('projects/<uuid:pk>/members/<uuid:member_pk>/role/', views.project_member_update, name='project_member_update'),
    path('projects/<uuid:pk>/members/<uuid:member_pk>/remove/', views.project_member_remove, name='project_member_remove'),
    path('projects/<uuid:pk>/hours/<uuid:user_pk>/', views.member_hour_history, name='member_hour_history'),
    path('projects/<uuid:pk>/sprints/new/', views.sprint_create, name='sprint_create'),
    path('projects/<uuid:pk>/sprints/<uuid:sprint_pk>/edit/', views.sprint_update, name='sprint_update'),
]
