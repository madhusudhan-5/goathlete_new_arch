import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Star } from 'lucide-react-native';
import { playerService } from '../../services/api';
import { colors, spacing, typography, radius } from '../../theme/tokens';

interface HistoryItem {
    type: 'formal' | 'local';
    match_id?: string;
    tournament_id?: number;
    tournament_name: string;
    sport_name: string;
    sport_icon: string;
    match_date: string;
    team_name?: string;
    stats: Record<string, any>;
    performance_rating?: number | null;
    is_man_of_match?: boolean;
    result?: string;
    status?: string;
}

const RESULT_COLORS: Record<string, string> = {
    Win: '#2ECC71',
    Loss: '#E74C3C',
    Draw: '#F1C40F',
};

export default function PerformanceScreen() {
    const router = useRouter();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const data = await playerService.getPerformanceHistory();
            setHistory(Array.isArray(data) ? data : []);
        } catch {
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    const renderRating = (rating: number | null | undefined) => {
        if (!rating) return null;
        const stars = Math.round(rating / 2);
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xxs }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <Star
                        key={i}
                        size={12}
                        color={i <= stars ? '#F1C40F' : colors.divider}
                        fill={i <= stars ? '#F1C40F' : 'transparent'}
                        style={{ marginRight: 2 }}
                    />
                ))}
                <Text style={{ color: colors.text.muted, fontSize: 11, marginLeft: 4, fontFamily: typography.fontFamily }}>
                    {rating.toFixed(1)} / 10
                </Text>
            </View>
        );
    };

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
                <Text style={{
                    flex: 1,
                    fontSize: typography.heading.h2.size,
                    fontWeight: typography.heading.h2.weight,
                    color: colors.text.primary,
                    fontFamily: typography.fontFamily,
                }}>
                    Performance History
                </Text>
                <Text style={{ color: colors.text.muted, fontFamily: typography.fontFamily, fontSize: typography.body.small.size }}>
                    {history.length} Records
                </Text>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.brand.accent} />
                </View>
            ) : history.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl }}>
                    <Text style={{ fontSize: 64, marginBottom: spacing.md }}>📊</Text>
                    <Text style={{
                        color: colors.text.primary,
                        fontSize: typography.heading.h3.size,
                        fontWeight: typography.heading.h3.weight,
                        fontFamily: typography.fontFamily,
                        textAlign: 'center',
                        marginBottom: spacing.xs,
                    }}>No History Yet</Text>
                    <Text style={{
                        color: colors.text.muted,
                        textAlign: 'center',
                        fontFamily: typography.fontFamily,
                        lineHeight: 20,
                    }}>
                        Participate in tournaments and matches to build your performance history.
                    </Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brand.accent} />}
                    contentContainerStyle={{ padding: spacing.md }}
                >
                    {history.map((item, idx) => (
                        <View
                            key={`${item.type}-${item.match_id || item.tournament_id}-${idx}`}
                            style={{
                                backgroundColor: colors.background.cardDark,
                                borderRadius: radius.xl,
                                padding: spacing.md,
                                marginBottom: spacing.sm,
                                borderWidth: 1,
                                borderColor: colors.divider,
                            }}
                        >
                            {/* Top Row */}
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs }}>
                                <Text style={{ fontSize: 28, marginRight: spacing.sm }}>{item.sport_icon}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        color: colors.text.primary,
                                        fontWeight: '700',
                                        fontFamily: typography.fontFamily,
                                        fontSize: typography.body.large.size,
                                    }} numberOfLines={1}>
                                        {item.tournament_name}
                                    </Text>
                                    <Text style={{
                                        color: colors.text.secondary,
                                        fontSize: typography.body.small.size,
                                        fontFamily: typography.fontFamily,
                                    }}>
                                        {item.sport_name}{item.team_name ? ` · ${item.team_name}` : ''}
                                    </Text>
                                    {renderRating(item.performance_rating)}
                                </View>

                                {/* Result badge */}
                                {item.result && (
                                    <View style={{
                                        paddingHorizontal: spacing.sm,
                                        paddingVertical: 4,
                                        borderRadius: radius.pill,
                                        backgroundColor: (RESULT_COLORS[item.result] || colors.text.muted) + '22',
                                        borderWidth: 1,
                                        borderColor: RESULT_COLORS[item.result] || colors.text.muted,
                                    }}>
                                        <Text style={{
                                            color: RESULT_COLORS[item.result] || colors.text.muted,
                                            fontWeight: '700',
                                            fontFamily: typography.fontFamily,
                                            fontSize: 11,
                                        }}>
                                            {item.result.toUpperCase()}
                                        </Text>
                                    </View>
                                )}

                                {/* Local status badge */}
                                {item.type === 'local' && item.status && (
                                    <View style={{
                                        paddingHorizontal: spacing.sm,
                                        paddingVertical: 4,
                                        borderRadius: radius.pill,
                                        backgroundColor: item.status === 'ACTIVE' ? '#2ECC7122' : '#64748b22',
                                        borderWidth: 1,
                                        borderColor: item.status === 'ACTIVE' ? '#2ECC71' : '#64748b',
                                    }}>
                                        <Text style={{
                                            color: item.status === 'ACTIVE' ? '#2ECC71' : '#94a3b8',
                                            fontWeight: '700',
                                            fontFamily: typography.fontFamily,
                                            fontSize: 10,
                                        }}>
                                            {item.status}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Man of Match */}
                            {item.is_man_of_match && (
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#F1C40F22',
                                    borderRadius: radius.md,
                                    padding: spacing.xs,
                                    marginBottom: spacing.xs,
                                    borderWidth: 1,
                                    borderColor: '#F1C40F',
                                }}>
                                    <Text style={{ fontSize: 16, marginRight: spacing.xs }}>⭐</Text>
                                    <Text style={{ color: '#F1C40F', fontWeight: '700', fontFamily: typography.fontFamily, fontSize: 12 }}>
                                        Man of the Match
                                    </Text>
                                </View>
                            )}

                            {/* Stats Chips */}
                            {item.stats && Object.keys(item.stats).length > 0 && (
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xxs }}>
                                    {Object.entries(item.stats).map(([key, val]) => (
                                        <View key={key} style={{
                                            backgroundColor: colors.background.screen,
                                            borderRadius: radius.md,
                                            paddingHorizontal: spacing.sm,
                                            paddingVertical: spacing.xxs,
                                            borderWidth: 1,
                                            borderColor: colors.divider,
                                        }}>
                                            <Text style={{ color: colors.brand.accent, fontWeight: '700', fontFamily: typography.fontFamily, fontSize: 13 }}>
                                                {String(val)}
                                            </Text>
                                            <Text style={{ color: colors.text.muted, fontSize: 10, fontFamily: typography.fontFamily, textTransform: 'uppercase' }}>
                                                {key}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Date + Type */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm }}>
                                <Text style={{ color: colors.text.muted, fontSize: typography.body.small.size, fontFamily: typography.fontFamily }}>
                                    📅 {item.match_date}
                                </Text>
                                <View style={{
                                    paddingHorizontal: spacing.xs,
                                    paddingVertical: 2,
                                    borderRadius: radius.sm,
                                    backgroundColor: item.type === 'local' ? '#3498DB22' : '#DA6F2B22',
                                }}>
                                    <Text style={{
                                        color: item.type === 'local' ? '#3498DB' : colors.brand.accent,
                                        fontSize: 10,
                                        fontWeight: '600',
                                        fontFamily: typography.fontFamily,
                                    }}>
                                        {item.type === 'local' ? 'LOCAL' : 'OFFICIAL'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                    <View style={{ height: spacing.xxl }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
