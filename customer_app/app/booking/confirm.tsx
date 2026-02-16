import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { bookingService } from '../../services/api';

export default function ConfirmBookingScreen() {
    const params = useLocalSearchParams();
    const { venueId, courtId, date, time, duration, price, total } = params;
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const router = useRouter();

    const handleConfirmBooking = async () => {
        setLoading(true);
        try {
            const bookingData = {
                court: courtId,
                booking_date: new Date(date as string).toISOString().split('T')[0],
                start_time: time,
                duration_hours: parseFloat(duration as string),
                price_per_hour: parseFloat(price as string),
                total_amount: parseFloat(total as string),
                booking_type: 'ONLINE',
                payment_method: paymentMethod.toUpperCase(),
                is_paid: paymentMethod === 'online'
            };

            await bookingService.create(bookingData);

            Alert.alert(
                'Success!',
                'Your booking has been confirmed',
                [
                    {
                        text: 'View Bookings',
                        onPress: () => router.replace('/(tabs)/bookings')
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Booking Failed',
                error.response?.data?.detail || 'Failed to create booking. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 py-4 bg-white border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-primary font-bold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-900">Confirm Booking</Text>
                <Text className="text-gray-500 mt-1">Review your booking details</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-4">
                {/* Booking Summary */}
                <View className="bg-white p-6 rounded-2xl mb-4 shadow-sm">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Booking Summary</Text>

                    <View className="space-y-3">
                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-gray-500">Date</Text>
                            <Text className="font-medium text-gray-900">{formatDate(date as string)}</Text>
                        </View>

                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-gray-500">Time</Text>
                            <Text className="font-medium text-gray-900">{time}</Text>
                        </View>

                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-gray-500">Duration</Text>
                            <Text className="font-medium text-gray-900">{duration} hour{parseFloat(duration as string) > 1 ? 's' : ''}</Text>
                        </View>

                        <View className="flex-row justify-between py-2 border-b border-gray-100">
                            <Text className="text-gray-500">Price per hour</Text>
                            <Text className="font-medium text-gray-900">₹{price}</Text>
                        </View>

                        <View className="flex-row justify-between py-3 mt-2">
                            <Text className="text-lg font-bold text-gray-900">Total Amount</Text>
                            <Text className="text-2xl font-bold text-primary">₹{total}</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Method */}
                <View className="bg-white p-6 rounded-2xl mb-4 shadow-sm">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Payment Method</Text>

                    <TouchableOpacity
                        onPress={() => setPaymentMethod('online')}
                        className={`flex-row items-center p-4 rounded-xl mb-3 border ${paymentMethod === 'online' ? 'border-primary bg-blue-50' : 'border-gray-200'
                            }`}
                    >
                        <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${paymentMethod === 'online' ? 'border-primary' : 'border-gray-300'
                            }`}>
                            {paymentMethod === 'online' && (
                                <View className="w-3 h-3 rounded-full bg-primary" />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-gray-900">Pay Online</Text>
                            <Text className="text-xs text-gray-500">UPI, Cards, Net Banking</Text>
                        </View>
                        <Text className="text-2xl">💳</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setPaymentMethod('cash')}
                        className={`flex-row items-center p-4 rounded-xl border ${paymentMethod === 'cash' ? 'border-primary bg-blue-50' : 'border-gray-200'
                            }`}
                    >
                        <View className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${paymentMethod === 'cash' ? 'border-primary' : 'border-gray-300'
                            }`}>
                            {paymentMethod === 'cash' && (
                                <View className="w-3 h-3 rounded-full bg-primary" />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-gray-900">Pay at Venue</Text>
                            <Text className="text-xs text-gray-500">Cash payment on arrival</Text>
                        </View>
                        <Text className="text-2xl">💵</Text>
                    </TouchableOpacity>
                </View>

                {/* Terms */}
                <View className="bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-200">
                    <Text className="text-sm text-yellow-800 mb-2 font-medium">⚠️ Cancellation Policy</Text>
                    <Text className="text-xs text-yellow-700">
                        • Free cancellation up to 24 hours before booking{'\n'}
                        • 50% refund for cancellations within 24 hours{'\n'}
                        • No refund for no-shows
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View className="bg-white px-6 py-4 border-t border-gray-200">
                <TouchableOpacity
                    onPress={handleConfirmBooking}
                    disabled={loading}
                    className={`bg-primary py-4 rounded-xl ${loading ? 'opacity-70' : ''}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-center text-lg">
                            {paymentMethod === 'online' ? 'Proceed to Payment' : 'Confirm Booking'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
