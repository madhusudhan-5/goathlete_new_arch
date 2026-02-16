import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Bookings() {
    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="p-6">
                <Text className="text-3xl font-bold text-gray-900 mb-6">Bookings</Text>

                <TouchableOpacity
                    onPress={() => router.push('/bookings/create')}
                    className="bg-primary p-6 rounded-xl mb-4"
                >
                    <Text className="text-white font-bold text-lg text-center">Create New Booking</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/bookings/block')}
                    className="bg-red-600 p-6 rounded-xl"
                >
                    <Text className="text-white font-bold text-lg text-center">Block Slot</Text>
                </TouchableOpacity>

                <View className="mt-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Today's Bookings</Text>
                    <Text className="text-center text-gray-400 mt-8">No bookings for today</Text>
                </View>
            </View>
        </ScrollView>
    );
}
