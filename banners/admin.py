from django.contrib import admin
from .models import BannerAd


@admin.register(BannerAd)
class BannerAdAdmin(admin.ModelAdmin):
    list_display = ['title', 'link_type', 'is_active', 'order', 'start_date', 'end_date']
    list_editable = ['is_active', 'order']
    list_filter = ['link_type', 'is_active']
    search_fields = ['title', 'subtitle']
    ordering = ['order']
