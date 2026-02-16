"""
Django settings for GoAthlete project.
"""

from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-development-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'accounts',
    'venues',
    'partners',
    'bookings',
    'tournaments',
    'players',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# OTP Settings
OTP_EXPIRY_MINUTES = 10
OTP_LENGTH = 6

# Email Settings (Microsoft 365 / Outlook)
# Email Configuration
# Options: 'console', 'smtp', 'msgraph'
USE_EMAIL_BACKEND = os.getenv('USE_EMAIL_BACKEND', 'console')

if USE_EMAIL_BACKEND == 'msgraph':
    # Microsoft Graph API Email Backend
    EMAIL_BACKEND = 'msgraph_email_backend.MSGraphEmailBackend'
    MS_CLIENT_ID = os.getenv('MS_CLIENT_ID', '')
    MS_CLIENT_SECRET = os.getenv('AZURE_CLIENT_SECRET')
    MS_TENANT_ID = os.getenv('MS_TENANT_ID', '')
    MS_SENDER_EMAIL = os.getenv('MS_SENDER_EMAIL', 'contact@goathlete.in')
    print("✅ Using Microsoft Graph API Email Backend - Real emails will be sent")
elif USE_EMAIL_BACKEND == 'smtp':
    # Use custom email backend to handle SSL certificate issues on macOS
    EMAIL_BACKEND = 'config.email_backend.CustomEmailBackend'
    print("✅ Using SMTP Email Backend - Real emails will be sent")
else:
    # Print emails to console for development
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    print("✅ Using Console Email Backend - OTPs will print in terminal")

EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.office365.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'contact@goathlete.in')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'Go-Athlete-Contact <contact@goathlete.in>')
SERVER_EMAIL = os.getenv('SERVER_EMAIL', 'contact@goathlete.in')
EMAIL_TIMEOUT = 10  # Timeout in seconds

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    'https://vendor.goathlete.in',
    'https://api.goathlete.in',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8081',  # Expo web dev server
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

