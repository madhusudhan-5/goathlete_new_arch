import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CheckCircle, Home, CalendarDays } from 'lucide-react-native';

export default function BookingSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookingId } = route.params || {};

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35] items-center justify-center px-8">
      <View className="items-center">
        <View className="w-24 h-24 rounded-full bg-green-500/20 items-center justify-center mb-6"
          style={{ shadowColor: '#22c55e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
          <CheckCircle size={52} color="#22c55e" />
        </View>
        <Text className="text-white font-bold text-2xl mb-2">Booking Confirmed!</Text>
        <Text className="text-[#94a3b8] text-sm text-center mb-2">
          Your court has been successfully booked.
        </Text>
        {bookingId && (
          <Text className="text-[#DA6F2B] font-bold text-sm mb-8">Booking ID: {bookingId}</Text>
        )}
        <View className="w-full gap-3">
          <TouchableOpacity
            onPress={() => navigation.navigate('BookingsTab', { screen: 'BookingsList' })}
            className="bg-[#DA6F2B] rounded-xl py-4 flex-row items-center justify-center"
            activeOpacity={0.85}
          >
            <CalendarDays size={18} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">View My Bookings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('HomeTab', { screen: 'HomeMain' })}
            className="bg-[#112B47] rounded-xl py-4 flex-row items-center justify-center border border-[#1e3a5f]"
            activeOpacity={0.85}
          >
            <Home size={18} color="#FFFFFF" />
            <Text className="text-white font-bold text-base ml-2">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
