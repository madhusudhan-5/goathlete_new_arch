"""
Venue Email Helper Functions
Sends professional emails for venue registration
"""
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from email_templates import (
    get_preregistration_email_html,
    get_preregistration_email_text,
    get_full_registration_email_html,
    get_full_registration_email_text
)


def send_venue_preregistration_email(venue, executive):
    """
    Send professional pre-registration confirmation email
    
    Args:
        venue: Venue model instance
        executive: Executive model instance
    """
    registration_details = {
        'city': venue.city,
        'state': venue.state,
        'email': venue.email,
        'phone': venue.phone
    }
    
    # Get HTML and plain text versions
    html_content = get_preregistration_email_html(
        venue_name=venue.name,
        owner_name=executive.user.email,  # Or executive name if available
        registration_details=registration_details
    )
    text_content = get_preregistration_email_text(
        venue_name=venue.name,
        owner_name=executive.user.email,
        registration_details=registration_details
    )
    
    # Create email
    email_message = EmailMultiAlternatives(
        subject=f'GoAthlete - {venue.name} Pre-Registration Successful',
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[venue.email]
    )
    email_message.attach_alternative(html_content, "text/html")
    
    # Send email
    email_message.send()
    
    return True


def send_venue_activation_email(venue, executive):
    """
    Send professional venue activation/full registration email
    
    Args:
        venue: Venue model instance
        executive: Executive model instance
    """
    activation_details = {
        'activated_at': venue.updated_at,
        'venue_url': f'https://goathlete.in/venues/{venue.id}'  # Update with actual URL
    }
    
    # Get HTML and plain text versions
    html_content = get_full_registration_email_html(
        venue_name=venue.name,
        owner_name=executive.user.email,
        venue_id=venue.id,
        activation_details=activation_details
    )
    text_content = get_full_registration_email_text(
        venue_name=venue.name,
        owner_name=executive.user.email,
        venue_id=venue.id,
        activation_details=activation_details
    )
    
    # Create email
    email_message = EmailMultiAlternatives(
        subject=f'🎉 {venue.name} is Now Live on GoAthlete!',
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[venue.email]
    )
    email_message.attach_alternative(html_content, "text/html")
    
    # Send email
    email_message.send()
    
    return True

