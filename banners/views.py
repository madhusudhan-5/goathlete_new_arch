from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.utils import timezone
from .models import BannerAd
from .serializers import BannerAdSerializer


class BannerAdViewSet(viewsets.ModelViewSet):
    """
    GET /api/banners/       — Public: returns active banners (date-gated)
    POST/PUT/DELETE         — Admin only
    """
    serializer_class = BannerAdSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        today = timezone.now().date()
        qs = BannerAd.objects.filter(is_active=True)
        # Date gating: only show banners within start/end dates
        qs = qs.filter(
            models.Q(start_date__isnull=True) | models.Q(start_date__lte=today)
        ).filter(
            models.Q(end_date__isnull=True) | models.Q(end_date__gte=today)
        )
        return qs.order_by('order', '-created_at')


from django.db import models
