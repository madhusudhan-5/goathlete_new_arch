"""
Professional Email Templates for GoAthlete
Includes OTP, Pre-Registration, and Full Registration templates
"""

from django.conf import settings


def get_email_header():
    """Common email header with GoAthlete branding"""
    return '''
    <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); 
                padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold; 
                   text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
            🏟️ GoAthlete
        </h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">
            Your Sports Venue Partner
        </p>
    </div>
    '''


def get_email_footer():
    """Common email footer"""
    return '''
    <div style="background-color: #2c3e50; color: white; padding: 30px 20px; 
                text-align: center; border-radius: 0 0 10px 10px; margin-top: 20px;">
        <p style="margin: 0 0 15px 0; font-size: 14px;">
            <strong>GoAthlete - Your Sports Venue Partner</strong>
        </p>
        <p style="margin: 0 0 10px 0; font-size: 13px; opacity: 0.9;">
            📧 contact@goathlete.in | 🌐 www.goathlete.in
        </p>
        <p style="margin: 0; font-size: 12px; opacity: 0.7;">
            © 2026 GoAthlete. All rights reserved.
        </p>
    </div>
    '''


# ============================================
# OTP EMAIL TEMPLATES
# ============================================

def get_otp_email_html(otp_code, user_name=None, purpose="login"):
    """
    Professional OTP email template
    
    Args:
        otp_code: The OTP code to display
        user_name: Optional user name for personalization
        purpose: Purpose of OTP (login, registration, verification, etc.)
    """
    greeting = f"Hello {user_name}," if user_name else "Hello,"
    
    purpose_text = {
        'login': 'login to your account',
        'registration': 'complete your registration',
        'verification': 'verify your identity',
        'reset': 'reset your password',
        'venue': 'register your venue'
    }.get(purpose, 'authenticate')
    
    html = f'''
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                 Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f6fa;">
        <div style="max-width: 600px; margin: 40px auto; background-color: white; 
                    border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            {get_email_header()}
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <p style="color: #2c3e50; font-size: 16px; margin: 0 0 20px 0; line-height: 1.6;">
                    {greeting}
                </p>
                
                <p style="color: #34495e; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">
                    Your One-Time Password (OTP) to <strong>{purpose_text}</strong> is:
                </p>
                
                <!-- OTP Box -->
                <div style="background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); 
                           padding: 25px; border-radius: 12px; text-align: center; 
                           margin: 30px 0; box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);">
                    <div style="color: white; font-size: 42px; font-weight: bold; 
                               letter-spacing: 12px; font-family: 'Courier New', monospace;
                               text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
                        {otp_code}
                    </div>
                </div>
                
                <!-- Info Box -->
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; 
                           padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                        ⏱️ <strong>Valid for 10 minutes</strong><br>
                        🔒 Keep this code confidential<br>
                        ❌ Do not share with anyone
                    </p>
                </div>
                
                <p style="color: #7f8c8d; font-size: 14px; margin: 25px 0 0 0; line-height: 1.6;">
                    If you didn't request this OTP, please ignore this email or contact our support team.
                </p>
            </div>
            
            {get_email_footer()}
        </div>
    </body>
    </html>
    '''
    return html


def get_otp_email_text(otp_code, user_name=None, purpose="login"):
    """Plain text version of OTP email"""
    greeting = f"Hello {user_name}," if user_name else "Hello,"
    
    purpose_text = {
        'login': 'login to your account',
        'registration': 'complete your registration',
        'verification': 'verify your identity',
        'reset': 'reset your password',
        'venue': 'register your venue'
    }.get(purpose, 'authenticate')
    
    return f'''
{greeting}

Your One-Time Password (OTP) to {purpose_text} is:

    {otp_code}

⏱️  This OTP is valid for 10 minutes.
🔒 Keep this code confidential and do not share it with anyone.

If you didn't request this OTP, please ignore this email or contact our support team.

Best regards,
GoAthlete Team

📧 contact@goathlete.in
🌐 www.goathlete.in

© 2026 GoAthlete. All rights reserved.
    '''


# ============================================
# PRE-REGISTRATION EMAIL TEMPLATES
# ============================================

def get_preregistration_email_html(venue_name, owner_name, registration_details):
    """
    Professional venue pre-registration confirmation email
    
    Args:
        venue_name: Name of the venue
        owner_name: Name of the venue owner
        registration_details: Dict with venue details
    """
    html = f'''
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                 Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f6fa;">
        <div style="max-width: 600px; margin: 40px auto; background-color: white; 
                    border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            {get_email_header()}
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <h2 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 24px;">
                    🎉 Pre-Registration Successful!
                </h2>
                
                <p style="color: #2c3e50; font-size: 16px; margin: 0 0 20px 0; line-height: 1.6;">
                    Dear {owner_name},
                </p>
                
                <p style="color: #34495e; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">
                    Thank you for pre-registering <strong>{venue_name}</strong> with GoAthlete! 
                    We're excited to have you join our platform.
                </p>
                
                <!-- Success Box -->
                <div style="background-color: #d4edda; border-left: 4px solid #28a745; 
                           padding: 20px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #155724; font-size: 15px; font-weight: bold;">
                        ✅ Your venue has been successfully pre-registered!
                    </p>
                </div>
                
                <!-- Venue Details Card -->
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 25px 0;">
                    <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px; 
                               border-bottom: 2px solid #ff6b35; padding-bottom: 10px;">
                        📋 Venue Details
                    </h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; color: #7f8c8d; font-size: 14px; width: 40%;">
                                <strong>Venue Name:</strong>
                            </td>
                            <td style="padding: 10px 0; color: #2c3e50; font-size: 14px;">
                                {venue_name}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #7f8c8d; font-size: 14px;">
                                <strong>Location:</strong>
                            </td>
                            <td style="padding: 10px 0; color: #2c3e50; font-size: 14px;">
                                {registration_details.get('city', 'N/A')}, {registration_details.get('state', 'N/A')}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #7f8c8d; font-size: 14px;">
                                <strong>Email:</strong>
                            </td>
                            <td style="padding: 10px 0; color: #2c3e50; font-size: 14px;">
                                {registration_details.get('email', 'N/A')}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #7f8c8d; font-size: 14px;">
                                <strong>Phone:</strong>
                            </td>
                            <td style="padding: 10px 0; color: #2c3e50; font-size: 14px;">
                                {registration_details.get('phone', 'N/A')}
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; color: #7f8c8d; font-size: 14px;">
                                <strong>Status:</strong>
                            </td>
                            <td style="padding: 10px 0; font-size: 14px;">
                                <span style="background-color: #fff3cd; color: #856404; padding: 4px 12px; 
                                           border-radius: 20px; font-size: 12px; font-weight: bold;">
                                    PRE-REGISTERED
                                </span>
                            </td>
                        </tr>
                    </table>
                </div>
                
                <!-- Next Steps -->
                <div style="background-color: #e7f3ff; border-left: 4px solid #0d6efd; 
                           padding: 20px; margin: 25px 0; border-radius: 4px;">
                    <h3 style="color: #084298; margin: 0 0 15px 0; font-size: 16px;">
                        📌 What's Next?
                    </h3>
                    <ol style="color: #0c63e4; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>Our team will review your registration</li>
                        <li>You'll receive a verification call within 2-3 business days</li>
                        <li>Once verified, your venue will be fully activated</li>
                        <li>You can then start accepting bookings!</li>
                    </ol>
                </div>
                
                <p style="color: #34495e; font-size: 15px; margin: 25px 0 0 0; line-height: 1.6;">
                    If you have any questions, feel free to reach out to our support team.
                </p>
            </div>
            
            {get_email_footer()}
        </div>
    </body>
    </html>
    '''
    return html


def get_preregistration_email_text(venue_name, owner_name, registration_details):
    """Plain text version of pre-registration email"""
    return f'''
Dear {owner_name},

🎉 Pre-Registration Successful!

Thank you for pre-registering {venue_name} with GoAthlete! We're excited to have you join our platform.

✅ Your venue has been successfully pre-registered!

VENUE DETAILS:
--------------
Venue Name: {venue_name}
Location: {registration_details.get('city', 'N/A')}, {registration_details.get('state', 'N/A')}
Email: {registration_details.get('email', 'N/A')}
Phone: {registration_details.get('phone', 'N/A')}
Status: PRE-REGISTERED

WHAT'S NEXT?
-----------
1. Our team will review your registration
2. You'll receive a verification call within 2-3 business days
3. Once verified, your venue will be fully activated
4. You can then start accepting bookings!

If you have any questions, feel free to reach out to our support team.

Best regards,
GoAthlete Team

📧 contact@goathlete.in
🌐 www.goathlete.in

© 2026 GoAthlete. All rights reserved.
    '''


# ============================================
# FULL REGISTRATION EMAIL TEMPLATES
# ============================================

def get_full_registration_email_html(venue_name, owner_name, venue_id, activation_details):
    """
    Professional venue full registration/activation email
    
    Args:
        venue_name: Name of the venue
        owner_name: Name of the venue owner
        venue_id: Unique venue ID
        activation_details: Dict with activation details
    """
    html = f'''
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                 Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f6fa;">
        <div style="max-width: 600px; margin: 40px auto; background-color: white; 
                    border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            {get_email_header()}
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <div style="text-align: center; margin: 0 0 30px 0;">
                    <div style="font-size: 64px; margin-bottom: 20px;">🎊</div>
                    <h2 style="color: #2c3e50; margin: 0; font-size: 28px;">
                        Venue Activated Successfully!
                    </h2>
                </div>
                
                <p style="color: #2c3e50; font-size: 16px; margin: 0 0 20px 0; line-height: 1.6;">
                    Dear {owner_name},
                </p>
                
                <p style="color: #34495e; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">
                    Congratulations! <strong>{venue_name}</strong> has been successfully verified and 
                    activated on the GoAthlete platform. You can now start accepting bookings!
                </p>
                
                <!-- Success Box -->
                <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                           padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;
                           box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">
                    <p style="color: white; font-size: 18px; font-weight: bold; margin: 0;">
                        ✅ YOUR VENUE IS NOW LIVE!
                    </p>
                </div>
                
                <!-- Venue ID Card -->
                <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; 
                           margin: 25px 0; text-align: center; border: 2px dashed #ff6b35;">
                    <p style="color: #7f8c8d; font-size: 14px; margin: 0 0 10px 0;">
                        Your Venue ID
                    </p>
                    <p style="color: #ff6b35; font-size: 24px; font-weight: bold; 
                              margin: 0; font-family: 'Courier New', monospace;">
                        #{venue_id}
                    </p>
                </div>
                
                <!-- Features Grid -->
                <div style="margin: 30px 0;">
                    <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-size: 18px;">
                        🚀 What You Can Do Now
                    </h3>
                    
                    <div style="display: table; width: 100%;">
                        <!-- Feature 1 -->
                        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; 
                                   margin-bottom: 15px;">
                            <div style="color: #856404; font-size: 14px;">
                                <strong>📅 Manage Bookings</strong><br>
                                <span style="font-size: 13px;">Accept and manage venue bookings in real-time</span>
                            </div>
                        </div>
                        
                        <!-- Feature 2 -->
                        <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; 
                                   margin-bottom: 15px;">
                            <div style="color: #155724; font-size: 14px;">
                                <strong>💰 Set Pricing</strong><br>
                                <span style="font-size: 13px;">Configure dynamic pricing for different time slots</span>
                            </div>
                        </div>
                        
                        <!-- Feature 3 -->
                        <div style="background-color: #cce5ff; padding: 15px; border-radius: 8px; 
                                   margin-bottom: 15px;">
                            <div style="color: #004085; font-size: 14px;">
                                <strong>📊 View Analytics</strong><br>
                                <span style="font-size: 13px;">Track bookings, revenue, and customer insights</span>
                            </div>
                        </div>
                        
                        <!-- Feature 4 -->
                        <div style="background-color: #f8d7da; padding: 15px; border-radius: 8px;">
                            <div style="color: #721c24; font-size: 14px;">
                                <strong>⭐ Get Reviews</strong><br>
                                <span style="font-size: 13px;">Build your reputation with customer reviews</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Start Guide -->
                <div style="background-color: #e7f3ff; border-left: 4px solid #0d6efd; 
                           padding: 20px; margin: 25px 0; border-radius: 4px;">
                    <h3 style="color: #084298; margin: 0 0 15px 0; font-size: 16px;">
                        🎯 Quick Start Guide
                    </h3>
                    <ol style="color: #0c63e4; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                        <li>Log in to your executive dashboard</li>
                        <li>Complete your venue profile with photos</li>
                        <li>Set up your availability and pricing</li>
                        <li>Share your venue link with customers</li>
                        <li>Start receiving bookings!</li>
                    </ol>
                </div>
                
                <!-- Support Info -->
                <div style="background-color: #fff3cd; border-radius: 8px; padding: 20px; margin: 25px 0;">
                    <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                        <strong>💡 Need Help?</strong><br>
                        Our support team is here to assist you 24/7. Contact us at 
                        <a href="mailto:contact@goathlete.in" style="color: #ff6b35; text-decoration: none;">
                            contact@goathlete.in
                        </a>
                    </p>
                </div>
                
                <p style="color: #34495e; font-size: 15px; margin: 25px 0 0 0; line-height: 1.6; 
                          text-align: center;">
                    Welcome to the GoAthlete family! 🎉
                </p>
            </div>
            
            {get_email_footer()}
        </div>
    </body>
    </html>
    '''
    return html


def get_full_registration_email_text(venue_name, owner_name, venue_id, activation_details):
    """Plain text version of full registration email"""
    return f'''
Dear {owner_name},

🎊 VENUE ACTIVATED SUCCESSFULLY!

Congratulations! {venue_name} has been successfully verified and activated on the GoAthlete platform. 
You can now start accepting bookings!

✅ YOUR VENUE IS NOW LIVE!

YOUR VENUE ID: #{venue_id}

WHAT YOU CAN DO NOW:
-------------------
📅 Manage Bookings - Accept and manage venue bookings in real-time
💰 Set Pricing - Configure dynamic pricing for different time slots
📊 View Analytics - Track bookings, revenue, and customer insights
⭐ Get Reviews - Build your reputation with customer reviews

QUICK START GUIDE:
-----------------
1. Log in to your executive dashboard
2. Complete your venue profile with photos
3. Set up your availability and pricing
4. Share your venue link with customers
5. Start receiving bookings!

NEED HELP?
---------
Our support team is here to assist you 24/7.
Contact us at: contact@goathlete.in

Welcome to the GoAthlete family! 🎉

Best regards,
GoAthlete Team

📧 contact@goathlete.in
🌐 www.goathlete.in

© 2026 GoAthlete. All rights reserved.
    '''

