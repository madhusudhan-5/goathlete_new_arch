import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { courtService } from '../../services/api';

export default function SelectCourtScreen() {
    const { venueId } = useLocalSearchParams();
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadCourts();
    }, [venueId]);

    const loadCourts = async () => {
        try {
            setLoading(true);
            const data = await courtService.getByVenue(venueId as string);
            setCourts(data.filter((c: any) => c.is_active));
        } catch (e) {
            console.error('Failed to load courts:', e);
            Alert.alert('Error', 'Failed to load courts');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCourt = (courtId: string) => {
        router.push(`/booking/select-slot?venueId=${venueId}&courtId=${courtId}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-6 py-4 bg-white border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Text className="text-primary font-bold">← Back</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-900">Select a Court</Text>
                <Text className="text-gray-500 mt-1">Choose from available courts</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-4">
                {loading ? (
                    <View className="py-12">
                        <ActivityIndicator size="large" color="#4F46E5" />
                    </View>
                ) : courts.length === 0 ? (
                    <View className="py-12 items-center">
                        <Text className="text-5xl mb-4">🏸</Text>
                        <Text className="text-gray-400 text-center">No courts available</Text>
                    </View>
                ) : (
                    courts.map((court: any) => (
                        <TouchableOpacity
                            key={court.id}
                            onPress={() => handleSelectCourt(court.id)}
                            className="bg-white p-6 rounded-2xl mb-4 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-1">
                                    <Text className="text-xl font-bold text-gray-900 mb-2">{court.name}</Text>
                                    <Text className="text-gray-600 mb-1">🏸 {court.sport}</Text>
                                    <Text className="text-sm text-gray-500">{court.location || 'Indoor Court'}</Text>
                                </View>
                                <View className="bg-green-100 px-3 py-1 rounded-full">
                                    <Text className="text-green-800 font-bold text-xs">Available</Text>
                                </View>
                            </View>

                            {court.surface_type && (
                                <View className="bg-blue-50 px-3 py-1 rounded-full self-start mb-3">
                                    <Text className="text-blue-700 text-xs font-medium">Surface: {court.surface_type}</Text>
                                </View>
                            )}

                            <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                                <Text className="text-gray-500 text-sm">Tap to view available slots</Text>
                                <Text className="text-primary font-bold text-xl">→</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
