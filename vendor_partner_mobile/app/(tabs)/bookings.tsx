import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Bookings() {
    return (
        <ScrollView className="flex-1 bg-[#F8F9FA]">
            <View className="p-6">
                <Text className="text-3xl font-extrabold text-[#0A1F35] mb-6">Bookings</Text>

                <TouchableOpacity
                    onPress={() => router.push('/bookings/create')}
                    className="bg-[#DA6F2B] p-6 rounded-2xl mb-4 shadow-lg shadow-[#DA6F2B]/20"
                >
                    <Text className="text-white font-bold text-lg text-center">Create New Booking</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/bookings/block')}
                    className="bg-red-500 p-6 rounded-2xl shadow-lg shadow-red-500/20"
                >
                    <Text className="text-white font-bold text-lg text-center">Block Slot</Text>
                </TouchableOpacity>

                <View className="mt-8">
                    <Text className="text-xl font-bold text-[#0A1F35] mb-4">Today's Bookings</Text>
                    <Text className="text-center text-gray-400 mt-10 font-medium">No bookings for today</Text>
                </View>
            </View>
        </ScrollView>
    );
}
