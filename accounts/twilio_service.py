"""
Twilio WhatsApp OTP Service
Handles sending OTP via WhatsApp using Twilio API
"""
from twilio.rest import Client
from django.conf import settings
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class TwilioWhatsAppService:
    """Service for sending WhatsApp messages via Twilio"""
    
    def __init__(self):
        self.account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
        self.auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
        self.whatsapp_from = getattr(settings, 'TWILIO_WHATSAPP_FROM', None)
        
        if not all([self.account_sid, self.auth_token, self.whatsapp_from]):
            logger.warning("Twilio credentials not configured. WhatsApp OTP will not be sent.")
            self.client = None
        else:
            self.client = Client(self.account_sid, self.auth_token)
    
    def send_otp(self, phone_number, otp):
        """
        Send OTP via WhatsApp
        
        Args:
            phone_number (str): Phone number with country code (e.g., +919876543210)
            otp (str): OTP code to send
            
        Returns:
            tuple: (success: bool, message_sid: str or error: str)
        """
        if not self.client:
            logger.error("Twilio client not initialized")
            # In development, just log the OTP
            logger.info(f"📱 WhatsApp OTP for {phone_number}: {otp}")
            return True, "DEV_MODE"
        
        try:
            # Format phone number for WhatsApp
            to_whatsapp = f"whatsapp:{phone_number}"
            from_whatsapp = f"whatsapp:{self.whatsapp_from}"
            
            # OTP message template (must be pre-approved by Twilio)
            message_body = f"""🏆 GoAthlete OTP

Your verification code is: *{otp}*

Valid for 5 minutes.

Do not share this code with anyone."""
            
            # Send message
            message = self.client.messages.create(
                body=message_body,
                from_=from_whatsapp,
                to=to_whatsapp
            )
            
            logger.info(f"WhatsApp OTP sent to {phone_number}. SID: {message.sid}")
            return True, message.sid
            
        except Exception as e:
            logger.error(f"Failed to send WhatsApp OTP to {phone_number}: {str(e)}")
            return False, str(e)
    
    def get_message_status(self, message_sid):
        """
        Get delivery status of a message
        
        Args:
            message_sid (str): Twilio message SID
            
        Returns:
            str: Message status (queued, sent, delivered, failed, etc.)
        """
        if not self.client:
            return "unknown"
        
        try:
            message = self.client.messages(message_sid).fetch()
            return message.status
        except Exception as e:
            logger.error(f"Failed to fetch message status for {message_sid}: {str(e)}")
            return "error"


class OTPService:
    """Service for OTP generation, validation, and rate limiting"""
    
    def __init__(self):
        self.twilio_service = TwilioWhatsAppService()
    
    def generate_and_send_otp(self, phone_number):
        """
        Generate OTP and send via WhatsApp
        
        Args:
            phone_number (str): Phone number with country code
            
        Returns:
            dict: {
                'success': bool,
                'message': str,
                'otp_id': int (if success)
            }
        """
        from accounts.otp_models import WhatsAppOTP, OTPRateLimit
        from django.contrib.auth.hashers import make_password
        
        # Check rate limit
        rate_limit, created = OTPRateLimit.objects.get_or_create(
            phone_number=phone_number
        )
        
        can_request, message = rate_limit.can_request_otp()
        if not can_request:
            return {
                'success': False,
                'message': message
            }
        
        # Expire any existing unverified OTPs for this number
        WhatsAppOTP.objects.filter(
            phone_number=phone_number,
            is_verified=False
        ).update(is_expired=True)
        
        # Generate OTP
        otp_code = WhatsAppOTP.generate_otp()
        otp_hash = make_password(otp_code)
        
        # Create OTP record
        otp = WhatsAppOTP.objects.create(
            phone_number=phone_number,
            otp=otp_code,
            otp_hash=otp_hash
        )
        
        # Send via WhatsApp
        success, result = self.twilio_service.send_otp(phone_number, otp_code)
        
        if success:
            otp.twilio_sid = result
            otp.twilio_status = 'sent'
            otp.save()
            
            # Increment rate limit
            rate_limit.increment()
            
            return {
                'success': True,
                'message': 'OTP sent successfully via WhatsApp',
                'otp_id': otp.id
            }
        else:
            otp.twilio_status = 'failed'
            otp.save()
            
            return {
                'success': False,
                'message': f'Failed to send OTP: {result}'
            }
    
    def verify_otp(self, phone_number, otp_code):
        """
        Verify OTP code
        
        Args:
            phone_number (str): Phone number
            otp_code (str): OTP code to verify
            
        Returns:
            dict: {
                'success': bool,
                'message': str,
                'otp': WhatsAppOTP object (if success)
            }
        """
        from accounts.otp_models import WhatsAppOTP
        
        # Get latest unverified OTP for this number
        try:
            otp = WhatsAppOTP.objects.filter(
                phone_number=phone_number,
                is_verified=False,
                is_expired=False
            ).latest('created_at')
        except WhatsAppOTP.DoesNotExist:
            return {
                'success': False,
                'message': 'No valid OTP found. Please request a new one.'
            }
        
        # Verify OTP
        if otp.verify(otp_code):
            return {
                'success': True,
                'message': 'OTP verified successfully',
                'otp': otp
            }
        else:
            if not otp.is_valid():
                if otp.is_expired or timezone.now() > otp.expires_at:
                    message = 'OTP has expired. Please request a new one.'
                elif otp.attempts >= otp.max_attempts:
                    message = 'Too many incorrect attempts. Please request a new OTP.'
                else:
                    message = 'OTP is no longer valid. Please request a new one.'
            else:
                attempts_left = otp.max_attempts - otp.attempts
                message = f'Invalid OTP. {attempts_left} attempts remaining.'
            
            return {
                'success': False,
                'message': message
            }
    
    def resend_otp(self, phone_number):
        """
        Resend OTP (generates new OTP)
        
        Args:
            phone_number (str): Phone number
            
        Returns:
            dict: Same as generate_and_send_otp
        """
        return self.generate_and_send_otp(phone_number)


# Singleton instance
otp_service = OTPService()
