import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Award } from 'lucide-react-native';
import { playerService } from '../../services/api';
import { colors, spacing, typography, radius } from '../../theme/tokens';

const BADGE_CATEGORY_COLORS: Record<string, string> = {
    TOURNAMENT: '#DA6F2B',
    PERFORMANCE: '#3498DB',
    MILESTONE: '#2ECC71',
    SPECIAL: '#9B59B6',
};

const CATEGORY_ICONS: Record<string, string> = {
    TOURNAMENT: '🏆',
    PERFORMANCE: '⚡',
    MILESTONE: '🎯',
    SPECIAL: '✨',
};

interface BadgeItem {
    id: number;
    badge: {
        code: string;
        name: string;
        description: string;
        icon: string;
        category: string;
    };
    earned_at: string;
}

interface AllBadge {
    id: number;
    code: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

export default function BadgesScreen() {
    const router = useRouter();
    const [earnedBadges, setEarnedBadges] = useState<BadgeItem[]>([]);
    const [allBadges, setAllBadges] = useState<AllBadge[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('ALL');

    const categories = ['ALL', 'TOURNAMENT', 'PERFORMANCE', 'MILESTONE', 'SPECIAL'];

    const load = async () => {
        try {
            const [earned, all] = await Promise.all([
                playerService.getBadges().catch(() => []),
                playerService.getAllBadges().catch(() => []),
            ]);
            setEarnedBadges(Array.isArray(earned) ? earned : earned.results || []);
            setAllBadges(Array.isArray(all) ? all : all.results || []);
        } catch {
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    const earnedCodes = new Set(earnedBadges.map(b => b.badge.code));

    const filteredBadges = allBadges.filter(b =>
        activeCategory === 'ALL' || b.category === activeCategory
    );

    const earnedCount = earnedBadges.length;
    const totalCount = allBadges.length;
    const progress = totalCount > 0 ? earnedCount / totalCount : 0;

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
                    Badges & Achievements
                </Text>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.brand.accent} />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brand.accent} />}
                >
                    {/* Progress Banner */}
                    <View style={{
                        margin: spacing.lg,
                        backgroundColor: colors.background.cardDark,
                        borderRadius: radius.xl,
                        padding: spacing.lg,
                        borderWidth: 1,
                        borderColor: colors.divider,
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                            <Award size={28} color={colors.brand.accent} style={{ marginRight: spacing.sm }} />
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    color: colors.text.primary,
                                    fontSize: typography.heading.h3.size,
                                    fontWeight: typography.heading.h3.weight,
                                    fontFamily: typography.fontFamily,
                                }}>
                                    {earnedCount} / {totalCount} Badges Earned
                                </Text>
                                <Text style={{ color: colors.text.secondary, fontSize: typography.body.small.size, fontFamily: typography.fontFamily }}>
                                    Keep playing to unlock more!
                                </Text>
                            </View>
                            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.brand.accent, fontFamily: typography.fontFamily }}>
                                {Math.round(progress * 100)}%
                            </Text>
                        </View>
                        {/* Progress bar */}
                        <View style={{ height: 8, backgroundColor: colors.divider, borderRadius: 4 }}>
                            <View style={{
                                height: 8,
                                backgroundColor: colors.brand.accent,
                                borderRadius: 4,
                                width: `${progress * 100}%`,
                            }} />
                        </View>
                    </View>

                    {/* Category Filter */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}
                    >
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setActiveCategory(cat)}
                                style={{
                                    paddingHorizontal: spacing.md,
                                    paddingVertical: spacing.xs,
                                    borderRadius: radius.pill,
                                    backgroundColor: activeCategory === cat ? colors.brand.accent : colors.background.cardDark,
                                    borderWidth: 1,
                                    borderColor: activeCategory === cat ? colors.brand.accent : colors.divider,
                                    marginRight: spacing.xs,
                                }}
                            >
                                <Text style={{
                                    color: activeCategory === cat ? '#fff' : colors.text.secondary,
                                    fontWeight: '600',
                                    fontFamily: typography.fontFamily,
                                    fontSize: typography.body.small.size,
                                }}>
                                    {cat === 'ALL' ? '🏅 All' : `${CATEGORY_ICONS[cat]} ${cat.charAt(0) + cat.slice(1).toLowerCase()}`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Badge Grid */}
                    <View style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        paddingHorizontal: spacing.md,
                        gap: spacing.sm,
                    }}>
                        {filteredBadges.length === 0 ? (
                            <View style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.xxl }}>
                                <Text style={{ fontSize: 56, marginBottom: spacing.md }}>🏅</Text>
                                <Text style={{ color: colors.text.secondary, fontFamily: typography.fontFamily, textAlign: 'center' }}>
                                    No badges in this category yet
                                </Text>
                            </View>
                        ) : (
                            filteredBadges.map(badge => {
                                const isEarned = earnedCodes.has(badge.code);
                                const catColor = BADGE_CATEGORY_COLORS[badge.category] || colors.brand.accent;
                                return (
                                    <View
                                        key={badge.id}
                                        style={{
                                            width: '47%',
                                            backgroundColor: isEarned ? colors.background.cardDark : '#0A1F3580',
                                            borderRadius: radius.xl,
                                            padding: spacing.md,
                                            borderWidth: 1.5,
                                            borderColor: isEarned ? catColor : colors.divider,
                                            alignItems: 'center',
                                            opacity: isEarned ? 1 : 0.5,
                                        }}
                                    >
                                        <Text style={{ fontSize: 40, marginBottom: spacing.xs }}>
                                            {isEarned ? badge.icon : '🔒'}
                                        </Text>
                                        <Text style={{
                                            color: isEarned ? colors.text.primary : colors.text.muted,
                                            fontWeight: '700',
                                            fontFamily: typography.fontFamily,
                                            fontSize: typography.body.regular.size,
                                            textAlign: 'center',
                                            marginBottom: spacing.xxs,
                                        }}>
                                            {badge.name}
                                        </Text>
                                        <Text style={{
                                            color: colors.text.muted,
                                            fontSize: typography.body.small.size,
                                            fontFamily: typography.fontFamily,
                                            textAlign: 'center',
                                            lineHeight: 16,
                                        }} numberOfLines={3}>
                                            {badge.description}
                                        </Text>
                                        {isEarned && (
                                            <View style={{
                                                marginTop: spacing.xs,
                                                backgroundColor: catColor + '22',
                                                paddingHorizontal: spacing.sm,
                                                paddingVertical: 3,
                                                borderRadius: radius.pill,
                                            }}>
                                                <Text style={{ color: catColor, fontSize: 10, fontWeight: '700', fontFamily: typography.fontFamily }}>
                                                    ✓ EARNED
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        )}
                    </View>
                    <View style={{ height: spacing.xxl }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
