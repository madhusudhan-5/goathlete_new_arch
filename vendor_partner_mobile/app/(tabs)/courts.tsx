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
            <View className="flex-1 justify-center items-center bg-[#F8F9FA]">
                <ActivityIndicator size="large" color="#DA6F2B" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-[#F8F9FA]">
            <View className="p-6">
                <Text className="text-3xl font-extrabold text-[#0A1F35] mb-6">Courts</Text>

                {courts.length === 0 ? (
                    <Text className="text-center text-gray-400 mt-12 font-medium">No courts available</Text>
                ) : (
                    <View className="space-y-4">
                        {courts.map((court: any) => (
                            <View key={court.id} className="bg-white p-6 rounded-2xl shadow-sm border-0">
                                <View className="flex-row justify-between items-start mb-4">
                                    <View>
                                        <Text className="text-xl font-extrabold text-[#0A1F35] mb-1">{court.name}</Text>
                                        <Text className="text-xs font-bold text-[#DA6F2B] bg-[#DA6F2B]/10 self-start px-2 py-1 rounded-md uppercase tracking-wider">{court.sport}</Text>
                                    </View>
                                    <View className={`px-3 py-1.5 rounded-full ${court.is_active ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                        <Text className={`text-xs font-bold uppercase tracking-wide ${court.is_active ? 'text-emerald-800' : 'text-red-800'}`}>
                                            {court.is_active ? 'Active' : 'Inactive'}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-sm text-gray-600 font-medium">{court.location || 'No location'}</Text>
                                <Text className="text-xs text-gray-400 mt-2 font-bold tracking-wider">COURT ID: {court.id}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
