#!/usr/bin/env python3
"""
Test All Professional Email Templates
Tests OTP, Pre-Registration, and Full Registration emails
"""
import os
import django
from pathlib import Path

# Setup Django
import sys
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ['USE_EMAIL_BACKEND'] = 'msgraph'  # Use Microsoft Graph API

django.setup()

from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from email_templates import (
    get_otp_email_html,
    get_otp_email_text,
    get_preregistration_email_html,
    get_preregistration_email_text,
    get_full_registration_email_html,
    get_full_registration_email_text
)

test_email = "tomcruisesmp007@gmail.com"

print("=" * 70)
print("TESTING ALL PROFESSIONAL EMAIL TEMPLATES")
print("=" * 70)
print()

# ============================================
# Test 1: OTP Email
# ============================================
print("📧 Test 1: OTP Email")
print("-" * 70)

try:
    otp_code = "123456"
    html_content = get_otp_email_html(otp_code, "Tom Cruise", purpose="login")
    text_content = get_otp_email_text(otp_code, "Tom Cruise", purpose="login")
    
    email = EmailMultiAlternatives(
        subject='GoAthlete - Your OTP Code',
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[test_email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send()
    
    print("✅ OTP Email sent successfully!")
    print(f"   To: {test_email}")
    print(f"   OTP Code: {otp_code}")
    print()
except Exception as e:
    print(f"❌ Failed to send OTP email: {e}")
    print()

# ============================================
# Test 2: Pre-Registration Email
# ============================================
print("📧 Test 2: Pre-Registration Email")
print("-" * 70)

try:
    venue_name = "SportZone Arena"
    owner_name = "Tom Cruise"
    registration_details = {
        'city': 'Mumbai',
        'state': 'Maharashtra',
        'email': 'sportzone@example.com',
        'phone': '+91 98765 43210'
    }
    
    html_content = get_preregistration_email_html(venue_name, owner_name, registration_details)
    text_content = get_preregistration_email_text(venue_name, owner_name, registration_details)
    
    email = EmailMultiAlternatives(
        subject=f'GoAthlete - {venue_name} Pre-Registration Successful',
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[test_email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send()
    
    print("✅ Pre-Registration Email sent successfully!")
    print(f"   To: {test_email}")
    print(f"   Venue: {venue_name}")
    print()
except Exception as e:
    print(f"❌ Failed to send pre-registration email: {e}")
    print()

# ============================================
# Test 3: Full Registration/Activation Email
# ============================================
print("📧 Test 3: Full Registration/Activation Email")
print("-" * 70)

try:
    venue_name = "SportZone Arena"
    owner_name = "Tom Cruise"
    venue_id = "VN001"
    activation_details = {
        'activated_at': '2026-01-04',
        'venue_url': 'https://goathlete.in/venues/VN001'
    }
    
    html_content = get_full_registration_email_html(venue_name, owner_name, venue_id, activation_details)
    text_content = get_full_registration_email_text(venue_name, owner_name, venue_id, activation_details)
    
    email = EmailMultiAlternatives(
        subject=f'🎉 {venue_name} is Now Live on GoAthlete!',
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[test_email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send()
    
    print("✅ Full Registration Email sent successfully!")
    print(f"   To: {test_email}")
    print(f"   Venue: {venue_name}")
    print(f"   Venue ID: {venue_id}")
    print()
except Exception as e:
    print(f"❌ Failed to send full registration email: {e}")
    print()

# ============================================
# Summary
# ============================================
print("=" * 70)
print("📬 EMAIL TEST SUMMARY")
print("=" * 70)
print()
print("✅ All email templates tested!")
print()
print(f"📧 Check your inbox at: {test_email}")
print()
print("You should have received 3 emails:")
print("  1. OTP Email - Orange gradient with OTP code")
print("  2. Pre-Registration Email - Yellow status badge, venue details")
print("  3. Full Registration Email - Green success banner, venue activated")
print()
print("=" * 70)

