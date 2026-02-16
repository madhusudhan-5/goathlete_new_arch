import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { tournamentService } from '../../services/api';
import { TournamentCard } from '../../components/tournament/TournamentCard';
import { colors, spacing, typography } from '../../theme/tokens';

export default function TournamentsScreen() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const router = useRouter();

    useEffect(() => {
        loadTournaments();
    }, []);

    const loadTournaments = async () => {
        try {
            setLoading(true);
            const data = await tournamentService.getAll();
            setTournaments(data);
        } catch (e) {
            console.error('Failed to load tournaments:', e);
        } finally {
            setLoading(false);
        }
    };

    const filterTournaments = (status: string) => {
        const now = new Date();
        return tournaments.filter((tournament: any) => {
            const startDate = new Date(tournament.start_date);
            const endDate = new Date(tournament.end_date);

            if (status === 'upcoming') {
                return startDate > now && tournament.status === 'UPCOMING';
            } else if (status === 'ongoing') {
                return startDate <= now && endDate >= now && tournament.status === 'ONGOING';
            } else {
                return endDate < now || tournament.status === 'COMPLETED';
            }
        });
    };

    const filteredTournaments = filterTournaments(activeTab);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen }}>
            {/* Header */}
            <View style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                backgroundColor: colors.background.cardDark,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider
            }}>
                <Text style={{
                    fontSize: typography.heading.h1.size,
                    fontWeight: typography.heading.h1.weight,
                    color: colors.text.primary,
                    fontFamily: typography.fontFamily,
                    marginBottom: spacing.xxs
                }}>
                    Tournaments
                </Text>
                <Text style={{
                    color: colors.text.secondary,
                    fontSize: typography.body.regular.size,
                    fontFamily: typography.fontFamily
                }}>
                    Join and compete
                </Text>
            </View>

            {/* Tabs */}
            <View style={{
                flexDirection: 'row',
                backgroundColor: colors.background.cardDark,
                paddingHorizontal: spacing.lg,
                paddingBottom: spacing.xs,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider
            }}>
                <TouchableOpacity
                    onPress={() => setActiveTab('upcoming')}
                    style={{
                        flex: 1,
                        paddingVertical: spacing.sm,
                        borderBottomWidth: 2,
                        borderBottomColor: activeTab === 'upcoming' ? colors.brand.accent : 'transparent'
                    }}
                >
                    <Text style={{
                        textAlign: 'center',
                        fontWeight: typography.body.large.weight,
                        color: activeTab === 'upcoming' ? colors.brand.accent : colors.text.secondary,
                        fontFamily: typography.fontFamily,
                        fontSize: typography.body.regular.size
                    }}>
                        Upcoming
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('ongoing')}
                    style={{
                        flex: 1,
                        paddingVertical: spacing.sm,
                        borderBottomWidth: 2,
                        borderBottomColor: activeTab === 'ongoing' ? colors.brand.accent : 'transparent'
                    }}
                >
                    <Text style={{
                        textAlign: 'center',
                        fontWeight: typography.body.large.weight,
                        color: activeTab === 'ongoing' ? colors.brand.accent : colors.text.secondary,
                        fontFamily: typography.fontFamily,
                        fontSize: typography.body.regular.size
                    }}>
                        Ongoing
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('completed')}
                    style={{
                        flex: 1,
                        paddingVertical: spacing.sm,
                        borderBottomWidth: 2,
                        borderBottomColor: activeTab === 'completed' ? colors.brand.accent : 'transparent'
                    }}
                >
                    <Text style={{
                        textAlign: 'center',
                        fontWeight: typography.body.large.weight,
                        color: activeTab === 'completed' ? colors.brand.accent : colors.text.secondary,
                        fontFamily: typography.fontFamily,
                        fontSize: typography.body.regular.size
                    }}>
                        Completed
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={{ flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md }}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={loadTournaments}
                        tintColor={colors.brand.accent}
                    />
                }
            >
                {loading ? (
                    <View style={{ paddingVertical: spacing.xxl }}>
                        <ActivityIndicator size="large" color={colors.brand.accent} />
                    </View>
                ) : filteredTournaments.length === 0 ? (
                    <View style={{ paddingVertical: spacing.xxl, alignItems: 'center' }}>
                        <Text style={{ fontSize: 64, marginBottom: spacing.md }}>🏆</Text>
                        <Text style={{
                            color: colors.text.secondary,
                            textAlign: 'center',
                            fontSize: typography.heading.h3.size,
                            fontWeight: typography.heading.h3.weight,
                            marginBottom: spacing.xs,
                            fontFamily: typography.fontFamily
                        }}>
                            No {activeTab} tournaments
                        </Text>
                        <Text style={{
                            color: colors.text.muted,
                            textAlign: 'center',
                            fontSize: typography.body.small.size,
                            fontFamily: typography.fontFamily
                        }}>
                            {activeTab === 'upcoming' ? 'Check back soon for new tournaments!' : 'Tournaments will appear here'}
                        </Text>
                    </View>
                ) : (
                    filteredTournaments.map((tournament: any) => (
                        <TournamentCard
                            key={tournament.id}
                            tournament={{
                                id: tournament.id,
                                name: tournament.name,
                                sport: tournament.sport,
                                start_date: tournament.start_date,
                                end_date: tournament.end_date,
                                venue_name: tournament.venue?.name,
                                tournament_type: tournament.tournament_type,
                                entry_fee: tournament.entry_fee,
                                status: tournament.status
                            }}
                            onPress={() => router.push(`/tournaments/${tournament.id}`)}
                            onRegister={() => {
                                // Handle registration
                                router.push(`/tournaments/${tournament.id}`);
                            }}
                            onViewBracket={() => {
                                // Handle view bracket
                                router.push(`/tournaments/${tournament.id}/brackets`);
                            }}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
