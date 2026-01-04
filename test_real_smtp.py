#!/usr/bin/env python3
"""
Test Real SMTP Email Sending
This script sends a test email using actual SMTP credentials
"""
import os
import django
from pathlib import Path

# Setup Django
import sys
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Force SMTP backend
os.environ['USE_EMAIL_BACKEND'] = 'smtp'

django.setup()

from django.core.mail import send_mail
from django.conf import settings

print("=" * 60)
print("TESTING REAL SMTP EMAIL")
print("=" * 60)
print()

# Check SMTP configuration
print("📧 SMTP Configuration:")
print(f"   Host: {settings.EMAIL_HOST}")
print(f"   Port: {settings.EMAIL_PORT}")
print(f"   Use TLS: {settings.EMAIL_USE_TLS}")
print(f"   From: {settings.DEFAULT_FROM_EMAIL}")
print(f"   Username: {settings.EMAIL_HOST_USER}")
print()

# Test recipient
test_email = "tomcruisesmp007@gmail.com"
test_otp = "123456"

print(f"📤 Sending test OTP email to: {test_email}")
print(f"   OTP Code: {test_otp}")
print()

try:
    # Send email
    result = send_mail(
        subject='GoAthlete - Test OTP Email',
        message=f'''
Hello,

This is a TEST email from GoAthlete.

Your test OTP code is: {test_otp}

If you receive this email, SMTP is working correctly!

Best regards,
GoAthlete Team
contact@goathlete.in
        ''',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[test_email],
        html_message=f'''
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px;">
                <h2 style="color: #2c3e50; text-align: center;">GoAthlete - SMTP Test</h2>
                
                <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 20px 0;">
                    <p style="color: #555; font-size: 16px;">Hello,</p>
                    
                    <p style="color: #555; font-size: 16px;">
                        This is a <strong>TEST</strong> email from GoAthlete to verify SMTP configuration.
                    </p>
                    
                    <p style="color: #555; font-size: 16px;">
                        Your test OTP code is:
                    </p>
                    
                    <div style="background-color: #ff6b35; color: white; font-size: 32px; font-weight: bold; 
                               text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0;
                               letter-spacing: 8px;">
                        {test_otp}
                    </div>
                    
                    <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; 
                               padding: 15px; margin: 20px 0;">
                        <p style="color: #155724; margin: 0; font-weight: bold;">
                            ✅ If you receive this email, your SMTP configuration is working correctly!
                        </p>
                    </div>
                </div>
                
                <div style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
                    <p>Best regards,<br>GoAthlete Team</p>
                    <p>📧 contact@goathlete.in</p>
                </div>
            </div>
        </body>
        </html>
        ''',
        fail_silently=False,
    )
    
    print("✅ EMAIL SENT SUCCESSFULLY!")
    print()
    print("📬 Details:")
    print(f"   Recipient: {test_email}")
    print(f"   OTP Code: {test_otp}")
    print(f"   Subject: GoAthlete - Test OTP Email")
    print(f"   Result: {result} email(s) sent")
    print()
    print("🎉 SMTP is working! Check your inbox at:")
    print(f"   {test_email}")
    print()
    
except Exception as e:
    print("❌ EMAIL SENDING FAILED!")
    print()
    print(f"Error: {str(e)}")
    print()
    print("Possible issues:")
    print("1. SMTP credentials are incorrect")
    print("2. SMTP host/port settings are wrong")
    print("3. Email password needs to be an app-specific password")
    print("4. Firewall blocking SMTP port")
    print("5. TLS/SSL settings incorrect")
    print()
    print("Check your .env file and ensure:")
    print("   EMAIL_HOST=smtp.office365.com")
    print("   EMAIL_PORT=587")
    print("   EMAIL_USE_TLS=True")
    print("   EMAIL_HOST_USER=your-email@outlook.com")
    print("   EMAIL_HOST_PASSWORD=your-app-password")
    print()

print("=" * 60)

