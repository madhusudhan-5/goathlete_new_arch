import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, TrendingUp } from 'lucide-react-native';
import { playerService } from '../../services/api';
import { colors, spacing, typography, radius } from '../../theme/tokens';

const SPORT_STAT_LABELS: Record<string, Record<string, string>> = {
    CRICKET: { runs: 'Runs', wickets: 'Wickets', overs: 'Overs', fours: '4s', sixes: '6s', catches: 'Catches' },
    FOOTBALL: { goals: 'Goals', assists: 'Assists', yellow_cards: 'Yellow Cards', red_cards: 'Red Cards' },
    BASKETBALL: { points: 'Points', rebounds: 'Rebounds', assists: 'Assists', steals: 'Steals' },
    BADMINTON: { points: 'Points', sets: 'Sets Won' },
    TENNIS: { sets: 'Sets Won', games: 'Games Won' },
    VOLLEYBALL: { points: 'Points', sets: 'Sets Won' },
    TABLE_TENNIS: { points: 'Points', sets: 'Sets Won' },
};

const SPORT_HIGHLIGHT_STAT: Record<string, string> = {
    CRICKET: 'runs',
    FOOTBALL: 'goals',
    BASKETBALL: 'points',
    BADMINTON: 'points',
    TENNIS: 'sets',
    VOLLEYBALL: 'points',
    TABLE_TENNIS: 'points',
};

interface SportStat {
    sport_name: string;
    sport_code: string;
    sport_icon: string;
    matches: number;
    aggregate_stats: Record<string, number>;
}

export default function SportRecordScreen() {
    const router = useRouter();
    const [sportStats, setSportStats] = useState<SportStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const load = async () => {
        try {
            const data = await playerService.getSportStats();
            setSportStats(Array.isArray(data) ? data : []);
        } catch {
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    const activeSport = sportStats[activeTab];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                backgroundColor: colors.background.cardDark,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
            }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.sm }}>
                    <ChevronLeft size={26} color={colors.brand.accent} />
                </TouchableOpacity>
                <TrendingUp size={22} color={colors.brand.accent} style={{ marginRight: spacing.xs }} />
                <Text style={{
                    flex: 1,
                    fontSize: typography.heading.h2.size,
                    fontWeight: typography.heading.h2.weight,
                    color: colors.text.primary,
                    fontFamily: typography.fontFamily,
                }}>
                    Sport Records
                </Text>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.brand.accent} />
                </View>
            ) : sportStats.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl }}>
                    <Text style={{ fontSize: 64, marginBottom: spacing.md }}>🏅</Text>
                    <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.heading.h3.size,
                        fontWeight: typography.heading.h3.weight,
                        fontFamily: typography.fontFamily,
                        textAlign: 'center',
                        marginBottom: spacing.xs,
                    }}>No Records Yet</Text>
                    <Text style={{
                        color: colors.text.muted,
                        textAlign: 'center',
                        fontFamily: typography.fontFamily,
                    }}>
                        Join tournaments and play matches to see your sport-specific career stats here.
                    </Text>
                </View>
            ) : (
                <>
                    {/* Sport Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}
                        style={{ backgroundColor: colors.background.cardDark, borderBottomWidth: 1, borderBottomColor: colors.divider }}
                    >
                        {sportStats.map((sport, i) => (
                            <TouchableOpacity
                                key={sport.sport_code}
                                onPress={() => setActiveTab(i)}
                                style={{
                                    alignItems: 'center',
                                    paddingHorizontal: spacing.md,
                                    paddingVertical: spacing.xs,
                                    borderRadius: radius.pill,
                                    backgroundColor: activeTab === i ? colors.brand.accent : 'transparent',
                                    borderWidth: 1,
                                    borderColor: activeTab === i ? colors.brand.accent : colors.divider,
                                    marginRight: spacing.sm,
                                    flexDirection: 'row',
                                }}
                            >
                                <Text style={{ fontSize: 18, marginRight: 6 }}>{sport.sport_icon}</Text>
                                <Text style={{
                                    color: activeTab === i ? '#fff' : colors.text.secondary,
                                    fontWeight: '600',
                                    fontFamily: typography.fontFamily,
                                    fontSize: typography.body.small.size,
                                }}>
                                    {sport.sport_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brand.accent} />}
                        contentContainerStyle={{ padding: spacing.lg }}
                    >
                        {activeSport && (
                            <>
                                {/* Hero card */}
                                <View style={{
                                    backgroundColor: colors.background.cardDark,
                                    borderRadius: radius.xl,
                                    padding: spacing.lg,
                                    marginBottom: spacing.lg,
                                    borderWidth: 1,
                                    borderColor: colors.brand.accent + '55',
                                    alignItems: 'center',
                                }}>
                                    <Text style={{ fontSize: 56, marginBottom: spacing.xs }}>{activeSport.sport_icon}</Text>
                                    <Text style={{
                                        color: colors.text.primary,
                                        fontSize: typography.heading.h2.size,
                                        fontWeight: typography.heading.h2.weight,
                                        fontFamily: typography.fontFamily,
                                    }}>
                                        {activeSport.sport_name}
                                    </Text>
                                    <Text style={{ color: colors.text.secondary, fontFamily: typography.fontFamily, marginTop: spacing.xxs }}>
                                        {activeSport.matches} {activeSport.matches === 1 ? 'Match' : 'Matches'} Played
                                    </Text>

                                    {/* Highlight stat */}
                                    {SPORT_HIGHLIGHT_STAT[activeSport.sport_code] && (
                                        <View style={{
                                            marginTop: spacing.md,
                                            backgroundColor: colors.brand.accent + '22',
                                            borderRadius: radius.lg,
                                            padding: spacing.md,
                                            alignItems: 'center',
                                            borderWidth: 1,
                                            borderColor: colors.brand.accent,
                                            minWidth: 120,
                                        }}>
                                            <Text style={{
                                                color: colors.brand.accent,
                                                fontSize: 42,
                                                fontWeight: '800',
                                                fontFamily: typography.fontFamily,
                                            }}>
                                                {Math.round(activeSport.aggregate_stats[SPORT_HIGHLIGHT_STAT[activeSport.sport_code]] ?? 0)}
                                            </Text>
                                            <Text style={{
                                                color: colors.text.secondary,
                                                fontSize: typography.body.small.size,
                                                fontFamily: typography.fontFamily,
                                                textTransform: 'uppercase',
                                                letterSpacing: 1,
                                            }}>
                                                Total {SPORT_STAT_LABELS[activeSport.sport_code]?.[SPORT_HIGHLIGHT_STAT[activeSport.sport_code]] ?? SPORT_HIGHLIGHT_STAT[activeSport.sport_code]}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* All Stats Grid */}
                                <Text style={{
                                    color: colors.text.primary,
                                    fontSize: typography.heading.h3.size,
                                    fontWeight: typography.heading.h3.weight,
                                    fontFamily: typography.fontFamily,
                                    marginBottom: spacing.sm,
                                }}>
                                    Career Statistics
                                </Text>

                                <View style={{
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: spacing.sm,
                                }}>
                                    {Object.entries(activeSport.aggregate_stats).map(([key, value]) => {
                                        const label = SPORT_STAT_LABELS[activeSport.sport_code]?.[key] ?? key;
                                        return (
                                            <View
                                                key={key}
                                                style={{
                                                    width: '47%',
                                                    backgroundColor: colors.background.cardDark,
                                                    borderRadius: radius.lg,
                                                    padding: spacing.md,
                                                    borderWidth: 1,
                                                    borderColor: colors.divider,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Text style={{
                                                    color: colors.brand.accent,
                                                    fontSize: 32,
                                                    fontWeight: '800',
                                                    fontFamily: typography.fontFamily,
                                                }}>
                                                    {Number.isInteger(value) ? value : value.toFixed(1)}
                                                </Text>
                                                <Text style={{
                                                    color: colors.text.muted,
                                                    fontSize: typography.body.small.size,
                                                    fontFamily: typography.fontFamily,
                                                    textAlign: 'center',
                                                    marginTop: spacing.xxs,
                                                }}>
                                                    {label}
                                                </Text>
                                            </View>
                                        );
                                    })}

                                    {/* Matches card always */}
                                    <View style={{
                                        width: '47%',
                                        backgroundColor: '#142A4488',
                                        borderRadius: radius.lg,
                                        padding: spacing.md,
                                        borderWidth: 1,
                                        borderColor: colors.divider,
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{ color: colors.text.secondary, fontSize: 32, fontWeight: '800', fontFamily: typography.fontFamily }}>
                                            {activeSport.matches}
                                        </Text>
                                        <Text style={{ color: colors.text.muted, fontSize: typography.body.small.size, fontFamily: typography.fontFamily, marginTop: spacing.xxs }}>
                                            Matches
                                        </Text>
                                    </View>
                                </View>

                                {Object.keys(activeSport.aggregate_stats).length === 0 && (
                                    <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
                                        <Text style={{ color: colors.text.muted, fontFamily: typography.fontFamily }}>
                                            No detailed stats recorded yet.
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                        <View style={{ height: spacing.xxl }} />
                    </ScrollView>
                </>
            )}
        </SafeAreaView>
    );
}
