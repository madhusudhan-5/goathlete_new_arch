import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CreditCard, CheckCircle } from 'lucide-react-native';
import { bookingService, paymentService } from '../../services/api';
import { RAZORPAY_CONFIG, APP_CONFIG, LOG_API_CALLS } from '../../config/env';

export default function BookingConfirmScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { venueId, courtId, courtName, date, startTime, duration, pricePerHour, total } = route.params || {};
  const [loading, setLoading] = useState(false);

  const formattedDate = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (LOG_API_CALLS) {
        // DEV: Skip real Razorpay, create booking directly
        console.log(`[DEV] Razorpay: Would charge ₹${total}. Creating booking directly.`);
        const booking = await bookingService.create({
          court: courtId,
          booking_date: new Date(date).toISOString().split('T')[0],
          start_time: startTime,
          duration_hours: duration,
          booking_type: 'ONLINE',
        });
        navigation.replace('BookingSuccess', { bookingId: booking.booking_id });
        return;
      }

      // PROD: Real Razorpay flow
      // 1. Create order on backend
      const order = await paymentService.createOrder({
        amount: Math.round(total * 100), // paise
        notes: { court_id: courtId, date, start_time: startTime },
      });

      // 2. Open Razorpay checkout
      const RazorpayCheckout = require('react-native-razorpay').default;
      const options = {
        description: `Court Booking — ${courtName}`,
        currency: RAZORPAY_CONFIG.currency,
        key: RAZORPAY_CONFIG.keyId,
        amount: order.amount,
        name: APP_CONFIG.appName,
        order_id: order.razorpay_order_id,
        prefill: { contact: '', email: '' },
        theme: { color: '#DA6F2B' },
      };

      const paymentData = await RazorpayCheckout.open(options);

      // 3. Verify payment & create booking
      await paymentService.verifyPayment({
        razorpay_order_id: order.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });

      const booking = await bookingService.create({
        court: courtId,
        booking_date: new Date(date).toISOString().split('T')[0],
        start_time: startTime,
        duration_hours: duration,
        booking_type: 'ONLINE',
        razorpay_payment_id: paymentData.razorpay_payment_id,
      });

      navigation.replace('BookingSuccess', { bookingId: booking.booking_id });
    } catch (error: any) {
      if (error?.code === 2) return; // User cancelled Razorpay
      Alert.alert('Payment Failed', error?.description || error?.message || 'Please try again');
      if (LOG_API_CALLS) console.error('[DEV] Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const rows = [
    { label: 'Court', value: courtName },
    { label: 'Date', value: formattedDate },
    { label: 'Time', value: startTime },
    { label: 'Duration', value: `${duration} hour${duration > 1 ? 's' : ''}` },
    { label: 'Price/hr', value: `₹${pricePerHour}` },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="flex-row items-center px-5 pt-2 pb-4 border-b border-[#1e3a5f]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-xl">Confirm Booking</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] p-5 mb-5">
          <Text className="text-white font-bold text-base mb-4">Booking Summary</Text>
          {rows.map(row => (
            <View key={row.label} className="flex-row justify-between py-2 border-b border-[#1e3a5f]/50">
              <Text className="text-[#94a3b8] text-sm">{row.label}</Text>
              <Text className="text-white text-sm font-semibold">{row.value}</Text>
            </View>
          ))}
          <View className="flex-row justify-between pt-4">
            <Text className="text-white font-bold text-base">Total Amount</Text>
            <Text className="text-[#DA6F2B] font-bold text-xl">₹{total}</Text>
          </View>
        </View>

        {/* DEV notice */}
        {LOG_API_CALLS && (
          <View className="bg-yellow-900/40 rounded-xl p-4 border border-yellow-500/30 mb-5">
            <Text className="text-yellow-400 text-xs font-bold mb-1">DEV MODE</Text>
            <Text className="text-yellow-200 text-xs">Razorpay is bypassed. Booking will be created directly without payment in dev mode.</Text>
          </View>
        )}

        <View className="bg-[#112B47] rounded-2xl border border-[#1e3a5f] p-4 mb-5 flex-row items-center">
          <CreditCard size={20} color="#DA6F2B" />
          <View className="ml-3 flex-1">
            <Text className="text-white font-semibold text-sm">Secure Payment</Text>
            <Text className="text-[#94a3b8] text-xs">Powered by Razorpay • UPI, Cards, Wallets</Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-8 pt-3 border-t border-[#1e3a5f]">
        <TouchableOpacity
          onPress={handlePayment}
          disabled={loading}
          className="bg-[#DA6F2B] rounded-xl py-4 items-center flex-row justify-center"
          style={{ opacity: loading ? 0.7 : 1 }}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CheckCircle size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">
                {LOG_API_CALLS ? 'Confirm Booking (DEV)' : `Pay ₹${total}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
