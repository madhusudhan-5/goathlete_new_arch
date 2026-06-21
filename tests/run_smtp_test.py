#!/usr/bin/env python
"""
SMTP Email Test Script
Tests email functionality with the configured SMTP settings
"""

import os
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_smtp():
    """Test SMTP email functionality"""
    print("=" * 60)
    print("SMTP EMAIL TEST")
    print("=" * 60)
    
    # Display current settings
    print("\n📧 Email Configuration:")
    print(f"   Backend: {settings.EMAIL_BACKEND}")
    print(f"   Host: {settings.EMAIL_HOST}")
    print(f"   Port: {settings.EMAIL_PORT}")
    print(f"   Use TLS: {settings.EMAIL_USE_TLS}")
    print(f"   From: {settings.DEFAULT_FROM_EMAIL}")
    print(f"   User: {settings.EMAIL_HOST_USER}")
    
    # Test email
    test_recipient = input("\n📬 Enter test recipient email: ").strip()
    
    if not test_recipient:
        print("❌ No recipient provided. Exiting.")
        return
    
    print(f"\n📤 Sending test email to: {test_recipient}")
    
    try:
        result = send_mail(
            subject='GoAthlete - SMTP Test Email',
            message='This is a test email from GoAthlete venue registration system.\n\nIf you received this email, SMTP is working correctly!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[test_recipient],
            fail_silently=False,
        )
        
        if result == 1:
            print("\n✅ Email sent successfully!")
            print(f"   Recipient: {test_recipient}")
            print(f"   From: {settings.DEFAULT_FROM_EMAIL}")
        else:
            print("\n❌ Email sending failed (no exception raised)")
            
    except Exception as e:
        print(f"\n❌ Error sending email:")
        print(f"   Error: {str(e)}")
        print(f"   Type: {type(e).__name__}")
        
        # Troubleshooting tips
        print("\n🔍 Troubleshooting Tips:")
        print("   1. Check EMAIL_HOST_PASSWORD in .env file")
        print("   2. Verify EMAIL_HOST and EMAIL_PORT are correct")
        print("   3. Ensure EMAIL_USE_TLS is set correctly")
        print("   4. Check firewall/network settings")
        print("   5. For Office365: Enable 'SMTP AUTH' in admin panel")
        
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_smtp()

