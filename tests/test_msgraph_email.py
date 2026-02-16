#!/usr/bin/env python3
"""
Test Microsoft Graph API Email Sending
Uses Azure App Registration credentials
"""
import os
import django
from pathlib import Path

# Setup Django
import sys
sys.path.insert(0, str(Path(__file__).parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Force Microsoft Graph backend
os.environ['USE_EMAIL_BACKEND'] = 'msgraph'

django.setup()

from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings

print("=" * 70)
print("TESTING MICROSOFT GRAPH API EMAIL")
print("=" * 70)
print()

# Check configuration
print("📧 Azure App Registration Configuration:")
print(f"   Client ID: {settings.MS_CLIENT_ID}")
print(f"   Tenant ID: {settings.MS_TENANT_ID}")
print(f"   Sender Email: {settings.MS_SENDER_EMAIL}")
print(f"   Client Secret: {'*' * 20} (hidden)")
print()

# Test recipient
test_email = "tomcruisesmp007@gmail.com"
test_otp = "987654"

print(f"📤 Sending test OTP email via Microsoft Graph API")
print(f"   To: {test_email}")
print(f"   OTP Code: {test_otp}")
print()

try:
    # Create HTML email
    subject = 'GoAthlete - Microsoft Graph API Test'
    
    plain_text = f'''
Hello,

This is a TEST email sent via Microsoft Graph API with Azure App Registration!

Your test OTP code is: {test_otp}

✅ If you receive this email, Microsoft Graph API is working correctly!

Configuration:
- Client ID: {settings.MS_CLIENT_ID}
- Tenant ID: {settings.MS_TENANT_ID}
- Sender: {settings.MS_SENDER_EMAIL}

Best regards,
GoAthlete Team
contact@goathlete.in
    '''
    
    html_content = f'''
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 10px; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center;">🚀 Microsoft Graph API Test</h2>
            
            <div style="background-color: white; border-radius: 8px; padding: 30px; margin: 20px 0;">
                <p style="color: #555; font-size: 16px;">Hello,</p>
                
                <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; 
                           padding: 15px; margin: 20px 0;">
                    <p style="color: #0c5460; margin: 0; font-weight: bold;">
                        ✅ This email was sent via <strong>Microsoft Graph API</strong> using Azure App Registration!
                    </p>
                </div>
                
                <p style="color: #555; font-size: 16px;">
                    Your test OTP code is:
                </p>
                
                <div style="background-color: #28a745; color: white; font-size: 32px; font-weight: bold; 
                           text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0;
                           letter-spacing: 8px;">
                    {test_otp}
                </div>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; 
                           padding: 15px; margin: 20px 0;">
                    <p style="color: #856404; margin: 0; font-size: 14px;">
                        <strong>Configuration Details:</strong><br>
                        📋 Client ID: {settings.MS_CLIENT_ID[:20]}...<br>
                        🏢 Tenant ID: {settings.MS_TENANT_ID[:20]}...<br>
                        📧 Sender: {settings.MS_SENDER_EMAIL}
                    </p>
                </div>
                
                <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; 
                           padding: 15px; margin: 20px 0;">
                    <p style="color: #155724; margin: 0; font-weight: bold;">
                        ✅ Microsoft Graph API is working correctly!
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
    '''
    
    # Create email with HTML
    email = EmailMultiAlternatives(
        subject=subject,
        body=plain_text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[test_email]
    )
    email.attach_alternative(html_content, "text/html")
    
    # Send
    print("🔄 Acquiring access token...")
    result = email.send()
    
    if result == 1:
        print()
        print("=" * 70)
        print("✅ EMAIL SENT SUCCESSFULLY VIA MICROSOFT GRAPH API!")
        print("=" * 70)
        print()
        print("📬 Details:")
        print(f"   Method: Microsoft Graph API (OAuth 2.0)")
        print(f"   Recipient: {test_email}")
        print(f"   OTP Code: {test_otp}")
        print(f"   Subject: {subject}")
        print(f"   From: {settings.DEFAULT_FROM_EMAIL}")
        print()
        print("🎉 Microsoft Graph API is configured correctly!")
        print("   - Azure App Registration: Working")
        print("   - OAuth 2.0 Authentication: Success")
        print("   - Email Sending: Successful")
        print()
        print(f"📱 Check your inbox at: {test_email}")
        print()
    else:
        print("⚠️  Email sending returned unexpected result")
    
except Exception as e:
    print()
    print("=" * 70)
    print("❌ EMAIL SENDING FAILED!")
    print("=" * 70)
    print()
    print(f"Error: {str(e)}")
    print()
    print("Possible issues:")
    print()
    print("1. ❌ Azure App Registration not configured correctly")
    print("   - Check Azure Portal → App Registrations")
    print("   - Verify Client ID, Client Secret, Tenant ID")
    print()
    print("2. ❌ API Permissions not granted")
    print("   - Go to API permissions in Azure Portal")
    print("   - Add 'Mail.Send' permission")
    print("   - Grant admin consent")
    print()
    print("3. ❌ Client Secret expired or incorrect")
    print("   - Generate new client secret in Azure Portal")
    print("   - Update MS_CLIENT_SECRET in settings")
    print()
    print("4. ❌ Sender email not configured")
    print("   - Verify contact@goathlete.in exists in Azure AD")
    print("   - Check mailbox is active")
    print()
    import traceback
    print("Full traceback:")
    traceback.print_exc()
    print()

print("=" * 70)

