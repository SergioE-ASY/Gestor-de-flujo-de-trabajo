from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('pricing/', views.pricing_view, name='pricing'),
    path('set-theme/', views.set_theme_view, name='set_theme'),
]
