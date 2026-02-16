from django.urls import path
from .views import ExecutiveLoginView, OTPVerifyView, AdminLoginView
from .otp_views import send_otp, verify_otp, resend_otp
from .admin_views import (
    AdminExecutiveListCreateView,
    AdminExecutiveDetailView,
    AdminExecutiveStatusView,
    AdminVenueListView,
    AdminVenueStatusView,
    AdminAnalyticsView,
)

urlpatterns = [
    # Authentication endpoints (/api/auth/)
    path('auth/executive/login', ExecutiveLoginView.as_view(), name='executive-login'),
    path('auth/executive/verify-otp', OTPVerifyView.as_view(), name='verify-otp'),
    path('auth/admin/login', AdminLoginView.as_view(), name='admin-login'),
    
    # WhatsApp OTP endpoints for Player login (/api/auth/)
    path('auth/send-otp', send_otp, name='send-otp'),
    path('auth/verify-otp-whatsapp', verify_otp, name='verify-otp-whatsapp'),
    path('auth/resend-otp', resend_otp, name='resend-otp'),
    
    # Admin endpoints for executive management (/api/admin/)
    path('admin/executives', AdminExecutiveListCreateView.as_view(), name='admin-executives-list'),
    path('admin/executives/<int:pk>', AdminExecutiveDetailView.as_view(), name='admin-executive-detail'),
    path('admin/executives/<int:pk>/status', AdminExecutiveStatusView.as_view(), name='admin-executive-status'),
    
    # Admin endpoints for venue management (/api/admin/)
    path('admin/venues', AdminVenueListView.as_view(), name='admin-venues-list'),
    path('admin/venues/<int:pk>/status', AdminVenueStatusView.as_view(), name='admin-venue-status'),
    
    # Admin analytics (/api/admin/)
    path('admin/analytics/dashboard', AdminAnalyticsView.as_view(), name='admin-analytics'),
]
