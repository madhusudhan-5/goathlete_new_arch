from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['razorpay_order_id', 'amount', 'currency', 'status', 'payment_for', 'created_at']
    list_filter = ['status', 'payment_for', 'created_at']
    search_fields = ['razorpay_order_id', 'razorpay_payment_id']
    readonly_fields = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'created_at', 'updated_at']
