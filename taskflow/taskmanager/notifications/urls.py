from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.notification_list, name='notification_list'),
    path('notifications/<uuid:pk>/read/', views.mark_read, name='notification_read'),
    path('notifications/read-all/', views.mark_all_read, name='notification_read_all'),
    path('notifications/count/', views.unread_count, name='notification_count'),
]
