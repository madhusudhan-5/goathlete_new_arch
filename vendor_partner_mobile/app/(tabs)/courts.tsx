import { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { courtService, partnerService } from '../../services/api';

export default function Courts() {
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profileData = await partnerService.getProfile();

            if (profileData.venue?.id) {
                const courtsData = await courtService.getByVenue(profileData.venue.id);
                setCourts(courtsData);
            }
        } catch (error) {
            console.error('Failed to load courts', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="p-6">
                <Text className="text-3xl font-bold text-gray-900 mb-6">Courts</Text>

                {courts.length === 0 ? (
                    <Text className="text-center text-gray-400 mt-12">No courts available</Text>
                ) : (
                    <View className="space-y-4">
                        {courts.map((court: any) => (
                            <View key={court.id} className="bg-white p-6 rounded-xl shadow-sm">
                                <View className="flex-row justify-between items-start mb-4">
                                    <View>
                                        <Text className="text-lg font-bold text-gray-900">{court.name}</Text>
                                        <Text className="text-sm text-gray-500">{court.sport}</Text>
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${court.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                                        <Text className={`text-xs font-bold ${court.is_active ? 'text-green-800' : 'text-gray-800'}`}>
                                            {court.is_active ? 'Active' : 'Inactive'}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-sm text-gray-600">{court.location || 'No location'}</Text>
                                <Text className="text-xs text-gray-400 mt-2">Court ID: {court.id}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
