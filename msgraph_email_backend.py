"""
Microsoft Graph API Email Backend for Django
Uses Azure App Registration with MSAL for authentication
"""
import requests
import msal
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings


class MSGraphEmailBackend(BaseEmailBackend):
    """
    Email backend that uses Microsoft Graph API to send emails
    """
    
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.client_id = settings.MS_CLIENT_ID
        self.client_secret = settings.MS_CLIENT_SECRET
        self.tenant_id = settings.MS_TENANT_ID
        self.sender_email = settings.MS_SENDER_EMAIL
        self.access_token = None
    
    def get_access_token(self):
        """Get access token using MSAL"""
        authority = f'https://login.microsoftonline.com/{self.tenant_id}'
        app = msal.ConfidentialClientApplication(
            self.client_id,
            authority=authority,
            client_credential=self.client_secret,
        )
        
        # Request token with Mail.Send scope
        result = app.acquire_token_for_client(
            scopes=['https://graph.microsoft.com/.default']
        )
        
        if 'access_token' in result:
            return result['access_token']
        else:
            error = result.get('error')
            error_description = result.get('error_description')
            raise Exception(f"Failed to acquire token: {error} - {error_description}")
    
    def send_messages(self, email_messages):
        """Send one or more EmailMessage objects"""
        if not email_messages:
            return 0
        
        # Get access token
        try:
            self.access_token = self.get_access_token()
        except Exception as e:
            if not self.fail_silently:
                raise
            print(f"Failed to get access token: {e}")
            return 0
        
        num_sent = 0
        for message in email_messages:
            if self._send(message):
                num_sent += 1
        
        return num_sent
    
    def _send(self, message):
        """Send a single EmailMessage"""
        try:
            # Prepare the email data for Graph API
            email_data = {
                'message': {
                    'subject': message.subject,
                    'body': {
                        'contentType': 'HTML' if message.content_subtype == 'html' else 'Text',
                        'content': message.body
                    },
                    'toRecipients': [
                        {'emailAddress': {'address': recipient}}
                        for recipient in message.to
                    ],
                    'from': {
                        'emailAddress': {
                            'address': self.sender_email
                        }
                    }
                },
                'saveToSentItems': 'true'
            }
            
            # Add CC if present
            if message.cc:
                email_data['message']['ccRecipients'] = [
                    {'emailAddress': {'address': recipient}}
                    for recipient in message.cc
                ]
            
            # Add BCC if present
            if message.bcc:
                email_data['message']['bccRecipients'] = [
                    {'emailAddress': {'address': recipient}}
                    for recipient in message.bcc
                ]
            
            # Handle HTML alternative
            if hasattr(message, 'alternatives') and message.alternatives:
                for content, mimetype in message.alternatives:
                    if mimetype == 'text/html':
                        email_data['message']['body'] = {
                            'contentType': 'HTML',
                            'content': content
                        }
                        break
            
            # Send via Microsoft Graph API
            endpoint = f'https://graph.microsoft.com/v1.0/users/{self.sender_email}/sendMail'
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(endpoint, json=email_data, headers=headers)
            
            if response.status_code == 202:
                print(f"✅ Email sent successfully to {', '.join(message.to)}")
                return True
            else:
                error_msg = f"Failed to send email: {response.status_code} - {response.text}"
                print(f"❌ {error_msg}")
                if not self.fail_silently:
                    raise Exception(error_msg)
                return False
                
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            if not self.fail_silently:
                raise
            return False

