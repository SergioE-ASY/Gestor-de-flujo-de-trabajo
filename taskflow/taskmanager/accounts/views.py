from django.shortcuts import render, redirect
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from .forms import LoginForm, RegisterForm, ProfileForm

PREMIUM_THEMES = {'pink', 'red', 'blue', 'green'}


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    form = LoginForm(request, data=request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            user = form.get_user()
            user.last_login_at = timezone.now()
            user.save(update_fields=['last_login_at'])
            login(request, user)
            next_url = request.GET.get('next', 'dashboard')
            return redirect(next_url)
    
    return render(request, 'accounts/login.html', {'form': form})


def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    form = RegisterForm(request.POST or None)
    if request.method == 'POST':
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'¡Bienvenido/a, {user.name}!')
            return redirect('dashboard')
    
    return render(request, 'accounts/register.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('login')


@login_required
def profile_view(request):
    form = ProfileForm(request.POST or None, request.FILES or None, instance=request.user)
    if request.method == 'POST':
        if form.is_valid():
            form.save()
            messages.success(request, 'Perfil actualizado correctamente.')
            return redirect('profile')

    return render(request, 'accounts/profile.html', {'form': form})


@login_required
@require_POST
def set_theme_view(request):
    base = request.POST.get('base')
    color = request.POST.get('color')
    fields = []

    if base is not None:
        if base not in {'dark', 'light'}:
            return JsonResponse({'error': 'Base inválida'}, status=400)
        request.user.base_theme = base
        fields.append('base_theme')

    if color is not None:
        valid_colors = {'default'} | PREMIUM_THEMES
        if color not in valid_colors:
            return JsonResponse({'error': 'Color inválido'}, status=400)
        if color in PREMIUM_THEMES and not request.user.is_premium:
            return JsonResponse({'error': 'Requiere plan Premium'}, status=403)
        request.user.color_theme = color
        fields.append('color_theme')

    if fields:
        request.user.save(update_fields=fields)
    return JsonResponse({'ok': True})
