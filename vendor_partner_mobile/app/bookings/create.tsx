import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { bookingService, courtService, partnerService } from '../../services/api';

export default function CreateBooking() {
    const [courts, setCourts] = useState([]);
    const [formData, setFormData] = useState({
        court: '',
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        duration_hours: 1,
        price_per_hour: 0,
        total_amount: 0,
        customer_name: '',
        customer_phone: '',
        notes: ''
    });

    useEffect(() => {
        loadCourts();
    }, []);

    const loadCourts = async () => {
        try {
            const profileData = await partnerService.getProfile();
            if (profileData.venue?.id) {
                const courtsData = await courtService.getByVenue(profileData.venue.id);
                setCourts(courtsData);
            }
        } catch (error) {
            console.error('Failed to load courts', error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.court || !formData.customer_name || !formData.customer_phone) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            await bookingService.create({
                ...formData,
                booking_type: 'OFFLINE'
            });
            Alert.alert('Success', 'Booking created successfully!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to create booking');
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="p-6">
                <Text className="text-3xl font-bold text-gray-900 mb-6">Create Booking</Text>

                <View className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Customer Name *</Text>
                        <TextInput
                            value={formData.customer_name}
                            onChangeText={(text) => setFormData({ ...formData, customer_name: text })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                            placeholder="Enter customer name"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Customer Phone *</Text>
                        <TextInput
                            value={formData.customer_phone}
                            onChangeText={(text) => setFormData({ ...formData, customer_phone: text })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Duration (hours) *</Text>
                        <TextInput
                            value={formData.duration_hours.toString()}
                            onChangeText={(text) => setFormData({ ...formData, duration_hours: parseFloat(text) || 1 })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                            keyboardType="numeric"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Price per Hour *</Text>
                        <TextInput
                            value={formData.price_per_hour.toString()}
                            onChangeText={(text) => {
                                const price = parseFloat(text) || 0;
                                setFormData({
                                    ...formData,
                                    price_per_hour: price,
                                    total_amount: price * formData.duration_hours
                                });
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                            keyboardType="numeric"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Total Amount</Text>
                        <Text className="text-2xl font-bold text-gray-900">₹{formData.total_amount}</Text>
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Notes</Text>
                        <TextInput
                            value={formData.notes}
                            onChangeText={(text) => setFormData({ ...formData, notes: text })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                            placeholder="Optional notes"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-primary py-4 rounded-lg mt-4"
                    >
                        <Text className="text-white font-bold text-center">Create Booking</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="border border-gray-200 py-4 rounded-lg"
                    >
                        <Text className="text-gray-700 font-medium text-center">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
