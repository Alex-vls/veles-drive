from django.utils import timezone
from .models import PageView, UserSession
import uuid

class AnalyticsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get or create session ID
        if 'session_id' not in request.session:
            request.session['session_id'] = str(uuid.uuid4())

        # Record page view
        if not request.path.startswith(('/admin/', '/static/', '/media/', '/api/')):
            PageView.objects.create(
                path=request.path,
                user=request.user if request.user.is_authenticated else None,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                referrer=request.META.get('HTTP_REFERER', ''),
                session_id=request.session['session_id']
            )

        response = self.get_response(request)

        # Update session end time
        if request.user.is_authenticated:
            UserSession.objects.filter(
                session_id=request.session['session_id']
            ).update(end_time=timezone.now())

        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip 