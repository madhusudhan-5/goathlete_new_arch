"""
Custom email backend to handle SSL certificate issues on macOS
"""
import ssl
from django.core.mail.backends.smtp import EmailBackend as SMTPBackend


class CustomEmailBackend(SMTPBackend):
    def open(self):
        """
        Override open to use custom SSL context that doesn't verify certificates
        """
        if self.connection:
            return False
        
        # Create connection with custom SSL context
        connection_params = {
            'timeout': self.timeout,
        }
        
        try:
            self.connection = self.connection_class(
                self.host, self.port, **connection_params
            )
            
            # Use TLS with unverified context for Microsoft 365
            if self.use_tls:
                # Create unverified SSL context
                context = ssl._create_unverified_context()
                self.connection.starttls(context=context)
            
            if self.use_ssl:
                # For SSL connections
                context = ssl._create_unverified_context()
                self.connection = self.connection_class(
                    self.host, self.port, 
                    **connection_params,
                    context=context
                )
            
            if self.username and self.password:
                self.connection.login(self.username, self.password)
            
            return True
        except Exception:
            if not self.fail_silently:
                raise

