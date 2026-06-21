import razorpay
import hmac
import hashlib
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from players.models import Player
from .models import Payment


def get_razorpay_client():
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


class CreateOrderView(APIView):
    """
    POST /api/payments/create-order/
    body: { amount (in INR), booking_id?, open_match_id?, notes? }
    Returns: { razorpay_order_id, amount (in paise), currency }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            player = Player.objects.get(user=request.user)
        except Player.DoesNotExist:
            return Response({'error': 'Player profile not found'}, status=status.HTTP_404_NOT_FOUND)

        amount_inr = request.data.get('amount')
        if not amount_inr:
            return Response({'error': 'amount is required'}, status=status.HTTP_400_BAD_REQUEST)

        amount_paise = int(float(amount_inr) * 100)

        try:
            client = get_razorpay_client()
            order = client.order.create({
                'amount': amount_paise,
                'currency': 'INR',
                'notes': request.data.get('notes', {}),
            })

            # Save payment record
            Payment.objects.create(
                razorpay_order_id=order['id'],
                amount=amount_inr,
                currency='INR',
                status='CREATED',
                player=player,
                booking_id=request.data.get('booking_id'),
                open_match_id=request.data.get('open_match_id'),
                tournament_id=request.data.get('tournament_id'),
                notes=request.data.get('notes', {}),
            )

            return Response({
                'razorpay_order_id': order['id'],
                'amount': amount_paise,
                'currency': 'INR',
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyPaymentView(APIView):
    """
    POST /api/payments/verify/
    body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id? }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('razorpay_order_id')
        payment_id = request.data.get('razorpay_payment_id')
        signature = request.data.get('razorpay_signature')

        if not all([order_id, payment_id, signature]):
            return Response({'error': 'Missing payment fields'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify signature
        key_secret = settings.RAZORPAY_KEY_SECRET.encode('utf-8')
        msg = f"{order_id}|{payment_id}".encode('utf-8')
        expected = hmac.new(key_secret, msg, hashlib.sha256).hexdigest()

        if not hmac.compare_digest(expected, signature):
            return Response({'error': 'Invalid payment signature'}, status=status.HTTP_400_BAD_REQUEST)

        # Update payment record
        try:
            payment = Payment.objects.get(razorpay_order_id=order_id)
            payment.razorpay_payment_id = payment_id
            payment.razorpay_signature = signature
            payment.status = 'SUCCESS'
            payment.save()

            # Mark booking as confirmed if linked
            if payment.booking_id:
                from bookings.models import Booking
                Booking.objects.filter(id=payment.booking_id).update(
                    status='CONFIRMED',
                    payment_id=payment_id,
                )

            return Response({'success': True, 'payment_id': payment_id})
        except Payment.DoesNotExist:
            return Response({'error': 'Payment record not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
