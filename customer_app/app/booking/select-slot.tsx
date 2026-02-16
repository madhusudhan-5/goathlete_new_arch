import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

export default function SelectSlotScreen() {
    const { venueId, courtId } = useLocalSearchParams();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [duration, setDuration] = useState(1);
    const router = useRouter();

    // Mock time slots (in production, fetch from API based on court availability)
    const timeSlots = [
        { time: '06:00 AM', available: true, price: 500 },
        { time: '07:00 AM', available: true, price: 500 },
        { time: '08:00 AM', available: false, price: 600 },
        { time: '09:00 AM', available: true, price: 600 },
        { time: '10:00 AM', available: true, price: 600 },
        { time: '11:00 AM', available: true, price: 600 },
        { time: '12:00 PM', available: true, price: 700 },
        { time: '01:00 PM', available: true, price: 700 },
        { time: '02:00 PM', available: false, price: 700 },
        { time: '03:00 PM', available: true, price: 700 },
        { time: '04:00 PM', available: true, price: 800 },
        { time: '05:00 PM', available: true, price: 800 },
        { time: '06:00 PM', available: true, price: 1000 },
        { time: '07:00 PM', available: true, price: 1000 },
        { time: '08:00 PM', available: false, price: 1000 },
        { time: '09:00 PM', available: true, price: 900 },
    ];

    const durations = [1, 1.5, 2, 2.5, 3];

    const handleProceed = () => {
        if (!selectedSlot) {
            Alert.alert('Error', 'Please select a time slot');
            return;
        }

        router.push({
            pathname: '/booking/confirm',
            params: {
                venueId,
                courtId,
                date: selectedDate.toISOString(),
                time: selectedSlot.time,
                duration,
                price: selectedSlot.price,
                total: selectedSlot.price * duration
            }
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    // Generate next 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return date;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 py-4 bg-white border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-primary font-bold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-900">Select Date & Time</Text>
                <Text className="text-gray-500 mt-1">Choose your preferred slot</Text>
            </View>

            <ScrollView className="flex-1">
                {/* Date Selection */}
                <View className="px-6 py-4 bg-white mb-2">
                    <Text className="text-sm font-bold text-gray-700 mb-3">Select Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {dates.map((date, idx) => {
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setSelectedDate(date)}
                                    className={`mr-3 px-4 py-3 rounded-xl ${isSelected ? 'bg-primary' : 'bg-gray-100'
                                        }`}
                                >
                                    <Text className={`text-xs font-medium mb-1 ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                                        {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                                    </Text>
                                    <Text className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                        {date.getDate()}
                                    </Text>
                                    <Text className={`text-xs ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                                        {date.toLocaleDateString('en-IN', { month: 'short' })}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Duration Selection */}
                <View className="px-6 py-4 bg-white mb-2">
                    <Text className="text-sm font-bold text-gray-700 mb-3">Duration (hours)</Text>
                    <View className="flex-row flex-wrap">
                        {durations.map((dur) => (
                            <TouchableOpacity
                                key={dur}
                                onPress={() => setDuration(dur)}
                                className={`mr-3 mb-3 px-6 py-2 rounded-full ${duration === dur ? 'bg-primary' : 'bg-gray-100'
                                    }`}
                            >
                                <Text className={`font-bold ${duration === dur ? 'text-white' : 'text-gray-700'}`}>
                                    {dur} hr{dur > 1 ? 's' : ''}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Time Slots */}
                <View className="px-6 py-4 bg-white mb-6">
                    <Text className="text-sm font-bold text-gray-700 mb-3">Available Slots</Text>
                    <View className="flex-row flex-wrap">
                        {timeSlots.map((slot, idx) => {
                            const isSelected = selectedSlot?.time === slot.time;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => slot.available && setSelectedSlot(slot)}
                                    disabled={!slot.available}
                                    className={`w-[30%] mr-[3%] mb-3 p-3 rounded-xl border ${isSelected
                                            ? 'bg-primary border-primary'
                                            : slot.available
                                                ? 'bg-white border-gray-200'
                                                : 'bg-gray-100 border-gray-200'
                                        }`}
                                >
                                    <Text className={`text-sm font-bold mb-1 ${isSelected ? 'text-white' : slot.available ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                        {slot.time}
                                    </Text>
                                    <Text className={`text-xs ${isSelected ? 'text-blue-200' : slot.available ? 'text-gray-500' : 'text-gray-400'
                                        }`}>
                                        ₹{slot.price}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Summary */}
            {selectedSlot && (
                <View className="bg-white px-6 py-4 border-t border-gray-200">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-sm text-gray-500">Total Amount</Text>
                            <Text className="text-2xl font-bold text-gray-900">₹{selectedSlot.price * duration}</Text>
                            <Text className="text-xs text-gray-400">{duration} hr × ₹{selectedSlot.price}/hr</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleProceed}
                            className="bg-primary px-8 py-3 rounded-xl"
                        >
                            <Text className="text-white font-bold text-lg">Proceed</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
