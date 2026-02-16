import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { scoreboardService } from '../../services/api';
import ScoreboardRenderer from '../../components/scoreboard/ScoreboardRenderer';

export default function MatchDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [match, setMatch] = useState<any>(null);
    const [template, setTemplate] = useState<any>(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 15000); // Poll every 15s for details
        return () => clearInterval(interval);
    }, [id]);

    const loadData = async () => {
        try {
            if (!id) return;

            const matchData = await scoreboardService.getMatchDetails(id as string);
            setMatch(matchData);

            // Fetch template if not already loaded (sport template generally static)
            if (!template && matchData.tournament?.sport_id) {
                const templateData = await scoreboardService.getSportTemplate(matchData.tournament.sport_id);
                setTemplate(templateData);
            }

            // Load detailed score/events if available
            // Note: Assuming matchData contains current score abstract, but events might be separate
            // const eventsData = await scoreboardService.getMatchEvents(id as string);
            // setEvents(eventsData);

            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    if (loading && !match) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#1E3A8A" />
            </View>
        );
    }

    if (!match) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-gray-500">Match not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen
                options={{
                    headerTitle: match.tournament_name || 'Match Details',
                    headerTintColor: '#1E3A8A',
                    headerStyle: { backgroundColor: 'white' },
                }}
            />

            <ScrollView
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
            >
                {/* Teams Header */}
                <View className="flex-row justify-between items-center mb-6 px-4">
                    <View className="items-center flex-1">
                        <View className="w-16 h-16 bg-gray-200 rounded-full mb-2 items-center justify-center">
                            <Text className="text-2xl">🛡️</Text>
                        </View>
                        <Text className="font-bold text-center text-gray-900">{match.team_a_name}</Text>
                    </View>

                    <View className="items-center px-4">
                        <Text className="text-2xl font-bold text-gray-400">VS</Text>
                        <Text className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full mt-1">
                            {match.status}
                        </Text>
                    </View>

                    <View className="items-center flex-1">
                        <View className="w-16 h-16 bg-gray-200 rounded-full mb-2 items-center justify-center">
                            <Text className="text-2xl">🛡️</Text>
                        </View>
                        <Text className="font-bold text-center text-gray-900">{match.team_b_name}</Text>
                    </View>
                </View>

                {/* Dynamic Scoreboard */}
                <View className="mb-6">
                    <ScoreboardRenderer
                        template={template}
                        score={match.scorecard || {}}
                    />
                </View>

                {/* Stats / Info Tabs */}
                <View className="flex-row bg-white rounded-xl mb-4 p-1 shadow-sm">
                    <TouchableOpacity className="flex-1 py-2 bg-gray-100 rounded-lg items-center">
                        <Text className="font-bold text-gray-800">Scorecard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 py-2 items-center">
                        <Text className="font-medium text-gray-500">Squads</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 py-2 items-center">
                        <Text className="font-medium text-gray-500">Info</Text>
                    </TouchableOpacity>
                </View>

                {/* Events Feed (Placeholder) */}
                <View className="bg-white rounded-xl p-4 shadow-sm">
                    <Text className="font-bold text-gray-800 mb-4">Match Commentary</Text>
                    <View className="py-8 items-center">
                        <Text className="text-gray-400">No commentary available for this match yet.</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
