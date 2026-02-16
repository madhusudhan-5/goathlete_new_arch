from rest_framework import routers
from django.urls import path, include
from .views import VendorAdminViewSet, VendorPartnerViewSet

router = routers.DefaultRouter()
router.register(r'admins', VendorAdminViewSet, basename='vendor-admin')
router.register(r'partners', VendorPartnerViewSet, basename='vendor-partner')

urlpatterns = [
    path('', include(router.urls)),
]
