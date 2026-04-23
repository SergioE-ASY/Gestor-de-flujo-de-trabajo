import time

from django.conf import settings
from django.contrib.auth import logout
from django.shortcuts import redirect
from django.utils import timezone

# URLs de polling/background que NO deben reiniciar el timer de sesión
PASSIVE_URLS = (
    '/notifications/count/',
)


class SessionTrackingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if (
            request.user.is_authenticated
            and hasattr(request, 'session')
            and request.session.session_key
        ):
            self._track(request)
        return response

    def _track(self, request):
        from .models import UserSession
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        ip = x_forwarded.split(',')[0].strip() if x_forwarded else request.META.get('REMOTE_ADDR')
        ua = request.META.get('HTTP_USER_AGENT', '')[:500]

        UserSession.objects.update_or_create(
            session_key=request.session.session_key,
            defaults={
                'user': request.user,
                'ip_address': ip,
                'user_agent': ua,
                'last_seen': timezone.now(),
            },
        )


class SessionTimeoutMiddleware:
    """
    Cierra la sesión del usuario tras 30 minutos de inactividad real.
    - Las peticiones a PASSIVE_URLS (polling) NO renuevan el timer.
    - El resto de peticiones (navegación, clicks, formularios) SÍ lo renuevan.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        self.timeout = getattr(settings, 'SESSION_COOKIE_AGE', 1800)

    def __call__(self, request):
        if request.user.is_authenticated and hasattr(request, 'session'):
            now = time.time()
            last_activity = request.session.get('_last_activity')
            is_passive = request.path in PASSIVE_URLS

            # Comprobar si la sesión ha expirado por inactividad
            if last_activity and (now - last_activity) > self.timeout:
                logout(request)
                if is_passive:
                    # El polling recibirá un 401/302 y el JS redirigirá
                    from django.http import JsonResponse
                    return JsonResponse({'expired': True}, status=401)
                return redirect(settings.LOGIN_URL)

            # Solo renovar el timestamp en peticiones activas (no polling)
            if not is_passive:
                request.session['_last_activity'] = now

        response = self.get_response(request)
        return response
