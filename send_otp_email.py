#!/usr/bin/env python
"""
Send OTP Email Test
Sends a test OTP email to verify SMTP functionality
"""

import os
import django
import random

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(recipient):
    """Send OTP email to recipient"""
    
    # Generate random 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    print("=" * 60)
    print("SENDING OTP EMAIL")
    print("=" * 60)
    
    # Email configuration
    print(f"\n📧 Configuration:")
    print(f"   Backend: {settings.EMAIL_BACKEND}")
    print(f"   Host: {settings.EMAIL_HOST}")
    print(f"   From: {settings.DEFAULT_FROM_EMAIL}")
    print(f"   To: {recipient}")
    print(f"   OTP: {otp}")
    
    # Email subject and message
    subject = 'GoAthlete - Your OTP Code'
    
    message = f"""
Hello,

Your One-Time Password (OTP) for GoAthlete Venue Registration is:

    {otp}

This OTP is valid for 10 minutes.

If you did not request this OTP, please ignore this email.

Best regards,
GoAthlete Team
contact@goathlete.in
    """
    
    html_message = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center;">GoAthlete Venue Registration</h2>
            
            <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 20px 0;">
                <p style="color: #555; font-size: 16px;">Hello,</p>
                
                <p style="color: #555; font-size: 16px;">
                    Your One-Time Password (OTP) for venue registration is:
                </p>
                
                <div style="background-color: #ff6b35; color: white; font-size: 32px; font-weight: bold; 
                           text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0;
                           letter-spacing: 8px;">
                    {otp}
                </div>
                
                <p style="color: #888; font-size: 14px;">
                    ⏱️ This OTP is valid for <strong>10 minutes</strong>
                </p>
                
                <p style="color: #888; font-size: 14px;">
                    If you did not request this OTP, please ignore this email.
                </p>
            </div>
            
            <div style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
                <p>Best regards,<br>GoAthlete Team</p>
                <p>📧 contact@goathlete.in</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        print(f"\n📤 Sending email...")
        
        result = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
            html_message=html_message,
        )
        
        if result == 1:
            print("\n✅ OTP EMAIL SENT SUCCESSFULLY!")
            print(f"\n📬 Details:")
            print(f"   Recipient: {recipient}")
            print(f"   OTP Code: {otp}")
            print(f"   Subject: {subject}")
            print(f"   From: {settings.DEFAULT_FROM_EMAIL}")
            
            if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
                print(f"\n⚠️  Note: Email printed to console (Console Backend)")
                print(f"   To send real emails, set USE_EMAIL_BACKEND=smtp in .env")
            else:
                print(f"\n✉️  Real email sent via SMTP!")
                print(f"   Check inbox: {recipient}")
                
        else:
            print("\n❌ Email sending failed")
            
    except Exception as e:
        print(f"\n❌ Error sending email:")
        print(f"   Error: {str(e)}")
        print(f"   Type: {type(e).__name__}")
        
        print("\n🔍 Troubleshooting:")
        print("   1. Check .env file for EMAIL_HOST_PASSWORD")
        print("   2. Set USE_EMAIL_BACKEND=smtp in .env")
        print("   3. Restart backend server after changes")
        print("   4. Verify email credentials are correct")
        
    print("\n" + "=" * 60)

if __name__ == "__main__":
    recipient = "tomcruisesmp007@gmail.com"
    send_otp_email(recipient)

