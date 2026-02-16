import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { tournamentService } from '../../services/api';

export default function TournamentDetailsScreen() {
    const { id } = useLocalSearchParams();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadTournamentDetails();
    }, [id]);

    const loadTournamentDetails = async () => {
        try {
            setLoading(true);
            const data = await tournamentService.getById(id as string);
            setTournament(data);
        } catch (e) {
            console.error('Failed to load tournament details:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        Alert.alert(
            'Confirm Registration',
            `Register for ${tournament.name}?${tournament.entry_fee ? `\n\nEntry Fee: ₹${tournament.entry_fee}` : ''}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Register',
                    onPress: async () => {
                        try {
                            setRegistering(true);
                            await tournamentService.register(id as string);
                            Alert.alert('Success!', 'You have been registered for the tournament');
                            loadTournamentDetails();
                        } catch (error: any) {
                            Alert.alert('Registration Failed', error.response?.data?.detail || 'Failed to register');
                        } finally {
                            setRegistering(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
            </SafeAreaView>
        );
    }

    if (!tournament) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text className="text-gray-400">Tournament not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView>
                {/* Header */}
                <View className="bg-gradient-to-br from-blue-100 to-indigo-100 p-6">
                    <TouchableOpacity onPress={() => router.back()} className="mb-4">
                        <Text className="text-primary font-bold">← Back</Text>
                    </TouchableOpacity>
                    <Text className="text-6xl mb-4 text-center">🏆</Text>
                    <Text className="text-3xl font-bold text-gray-900 text-center mb-2">{tournament.name}</Text>
                    <Text className="text-gray-600 text-center">{tournament.sport}</Text>
                </View>

                {/* Tournament Info */}
                <View className="bg-white px-6 py-6 -mt-4 rounded-t-3xl">
                    <View className={`px-4 py-2 rounded-full self-center mb-6 ${tournament.status === 'UPCOMING' ? 'bg-blue-100' :
                            tournament.status === 'ONGOING' ? 'bg-green-100' :
                                'bg-gray-100'
                        }`}>
                        <Text className={`font-bold ${tournament.status === 'UPCOMING' ? 'text-blue-800' :
                                tournament.status === 'ONGOING' ? 'text-green-800' :
                                    'text-gray-800'
                            }`}>
                            {tournament.status}
                        </Text>
                    </View>

                    {/* Details Grid */}
                    <View className="bg-gray-50 p-4 rounded-xl mb-6">
                        <View className="flex-row justify-between py-3 border-b border-gray-200">
                            <Text className="text-gray-500">📅 Start Date</Text>
                            <Text className="font-bold text-gray-900">
                                {new Date(tournament.start_date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-3 border-b border-gray-200">
                            <Text className="text-gray-500">📅 End Date</Text>
                            <Text className="font-bold text-gray-900">
                                {new Date(tournament.end_date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-3 border-b border-gray-200">
                            <Text className="text-gray-500">📍 Venue</Text>
                            <Text className="font-bold text-gray-900">{tournament.venue?.name || 'TBA'}</Text>
                        </View>
                        <View className="flex-row justify-between py-3 border-b border-gray-200">
                            <Text className="text-gray-500">👥 Format</Text>
                            <Text className="font-bold text-gray-900">{tournament.tournament_type}</Text>
                        </View>
                        <View className="flex-row justify-between py-3">
                            <Text className="text-gray-500">💰 Entry Fee</Text>
                            <Text className="font-bold text-primary">
                                {tournament.entry_fee ? `₹${tournament.entry_fee}` : 'Free'}
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    {tournament.description && (
                        <View className="mb-6">
                            <Text className="text-lg font-bold text-gray-900 mb-3">About</Text>
                            <Text className="text-gray-600 leading-6">{tournament.description}</Text>
                        </View>
                    )}

                    {/* Rules */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-3">Rules & Regulations</Text>
                        <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                            <Text className="text-sm text-yellow-800 leading-5">
                                • Players must arrive 15 minutes before match time{'\n'}
                                • Proper sports attire is mandatory{'\n'}
                                • Organizer's decision is final{'\n'}
                                • No refund after registration deadline
                            </Text>
                        </View>
                    </View>

                    {/* Participants */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-3">Participants</Text>
                        <View className="bg-gray-50 p-4 rounded-xl">
                            <Text className="text-center text-gray-600">
                                {tournament.max_participants ?
                                    `${tournament.participants_count || 0} / ${tournament.max_participants} registered` :
                                    `${tournament.participants_count || 0} registered`
                                }
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            {tournament.status === 'UPCOMING' && (
                <View className="bg-white px-6 py-4 border-t border-gray-200">
                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={registering}
                        className={`bg-primary py-4 rounded-xl ${registering ? 'opacity-70' : ''}`}
                    >
                        {registering ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-center text-lg">
                                Register Now {tournament.entry_fee ? `- ₹${tournament.entry_fee}` : '- Free'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {tournament.status === 'ONGOING' && (
                <View className="bg-white px-6 py-4 border-t border-gray-200">
                    <TouchableOpacity
                        onPress={() => router.push(`/tournaments/${id}/bracket`)}
                        className="bg-green-600 py-4 rounded-xl"
                    >
                        <Text className="text-white font-bold text-center text-lg">View Tournament Bracket</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
