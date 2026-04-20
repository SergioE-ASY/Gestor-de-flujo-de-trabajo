from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'role', 'is_premium', 'base_theme', 'color_theme', 'date_joined']
    list_filter = ['role', 'is_premium', 'base_theme', 'color_theme']
    search_fields = ['name', 'email']
    actions = ['activar_premium', 'desactivar_premium']

    @admin.action(description='Activar Premium a usuarios seleccionados')
    def activar_premium(self, request, queryset):
        updated = queryset.update(is_premium=True)
        self.message_user(request, f'{updated} usuario(s) marcados como Premium.')

    @admin.action(description='Desactivar Premium a usuarios seleccionados')
    def desactivar_premium(self, request, queryset):
        updated = queryset.update(is_premium=False)
        self.message_user(request, f'{updated} usuario(s) sin Premium.')
