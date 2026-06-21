from rest_framework import serializers
from .models import BannerAd


class BannerAdSerializer(serializers.ModelSerializer):
    class Meta:
        model = BannerAd
        fields = [
            'id', 'title', 'subtitle', 'image_base64', 'image_url',
            'link_type', 'link_id', 'external_url',
            'is_active', 'order', 'start_date', 'end_date',
        ]
