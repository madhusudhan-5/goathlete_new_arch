import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { slotBlockService, courtService, partnerService } from '../../services/api';

export default function BlockSlot() {
    const [courts, setCourts] = useState([]);
    const [formData, setFormData] = useState({
        court: '',
        block_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        reason: ''
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
        if (!formData.court || !formData.reason) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            await slotBlockService.create(formData);
            Alert.alert('Success', 'Slot blocked successfully!');
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.detail || 'Failed to block slot');
        }
    };

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="p-6">
                <Text className="text-3xl font-bold text-gray-900 mb-6">Block Slot</Text>

                <View className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Start Time *</Text>
                        <TextInput
                            value={formData.start_time}
                            onChangeText={(text) => setFormData({ ...formData, start_time: text })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                            placeholder="HH:MM (e.g., 09:00)"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">End Time *</Text>
                        <TextInput
                            value={formData.end_time}
                            onChangeText={(text) => setFormData({ ...formData, end_time: text })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                            placeholder="HH:MM (e.g., 18:00)"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Reason *</Text>
                        <TextInput
                            value={formData.reason}
                            onChangeText={(text) => setFormData({ ...formData, reason: text })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg"
                            placeholder="e.g., Maintenance, Private Event"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-red-600 py-4 rounded-lg mt-4"
                    >
                        <Text className="text-white font-bold text-center">Block Slot</Text>
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
