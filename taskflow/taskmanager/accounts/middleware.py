from django.utils import timezone


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
