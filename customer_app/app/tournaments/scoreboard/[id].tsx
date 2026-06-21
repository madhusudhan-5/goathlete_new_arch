import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
    Alert, RefreshControl, TextInput, Modal, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { localTournamentService } from '../../../services/api';
import { colors, spacing, typography, radius } from '../../../theme/tokens';

// ─── Sport config ───────────────────────────────────────────────────────────
const SPORT_SCORE_FIELDS: Record<string, { label: string; field: string; unit?: string; color?: string }[]> = {
    CRICKET: [
        { label: 'Runs', field: 'runs', color: colors.brand.accent },
        { label: 'Wickets', field: 'wickets', color: '#E74C3C' },
        { label: 'Overs', field: 'overs', unit: ' ov', color: '#3498DB' },
        { label: 'Balls', field: 'balls', color: '#9B59B6' },
        { label: 'Fours', field: 'fours', color: '#2ECC71' },
        { label: 'Sixes', field: 'sixes', color: '#F1C40F' },
    ],
    FOOTBALL: [
        { label: 'Goals', field: 'goals', color: '#2ECC71' },
        { label: 'Assists', field: 'assists', color: '#3498DB' },
        { label: 'Yellow Cards', field: 'yellow_cards', color: '#F1C40F' },
        { label: 'Red Cards', field: 'red_cards', color: '#E74C3C' },
    ],
    TENNIS: [
        { label: 'Sets', field: 'sets', color: '#DA6F2B' },
        { label: 'Games', field: 'games', color: '#3498DB' },
    ],
    BADMINTON: [
        { label: 'Points', field: 'points', color: '#DA6F2B' },
        { label: 'Sets', field: 'sets', color: '#3498DB' },
    ],
    BASKETBALL: [
        { label: 'Points', field: 'points', color: '#DA6F2B' },
        { label: 'Rebounds', field: 'rebounds', color: '#2ECC71' },
        { label: 'Assists', field: 'assists', color: '#3498DB' },
        { label: 'Steals', field: 'steals', color: '#9B59B6' },
    ],
    VOLLEYBALL: [
        { label: 'Points', field: 'points', color: '#DA6F2B' },
        { label: 'Sets', field: 'sets', color: '#3498DB' },
    ],
    TABLE_TENNIS: [
        { label: 'Points', field: 'points', color: '#DA6F2B' },
        { label: 'Sets', field: 'sets', color: '#3498DB' },
    ],
    DEFAULT: [
        { label: 'Score', field: 'score', color: '#DA6F2B' },
    ],
};

const SPORT_ICONS: Record<string, string> = {
    CRICKET: '🏏', FOOTBALL: '⚽', TENNIS: '🎾', BADMINTON: '🏸',
    BASKETBALL: '🏀', VOLLEYBALL: '🏐', TABLE_TENNIS: '🏓', DEFAULT: '🏆',
};

// Display columns on scoreboard (only primary 2-3 stats for the table)
const SCOREBOARD_COLS: Record<string, string[]> = {
    CRICKET: ['runs', 'wickets', 'overs'],
    FOOTBALL: ['goals', 'assists'],
    TENNIS: ['sets', 'games'],
    BADMINTON: ['points', 'sets'],
    BASKETBALL: ['points', 'rebounds', 'assists'],
    VOLLEYBALL: ['points', 'sets'],
    TABLE_TENNIS: ['points', 'sets'],
    DEFAULT: ['score'],
};

// Rank medal emoji
function rankLabel(i: number) {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `#${i + 1}`;
}

// Pulsing LIVE dot
function LivePulse() {
    const anim = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(anim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Animated.View style={{
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: '#2ECC71', marginRight: 6, opacity: anim
            }} />
            <Text style={{ color: '#2ECC71', fontSize: 11, fontWeight: '800', fontFamily: typography.fontFamily, letterSpacing: 1 }}>
                LIVE
            </Text>
        </View>
    );
}

export default function ScoreboardScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [editModal, setEditModal] = useState<{ visible: boolean; participant: any | null }>({ visible: false, participant: null });
    const [editScores, setEditScores] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [closing, setClosing] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const load = useCallback(async (silent = false) => {
        try {
            if (!silent) { /* loading spinner already shown */ }
            const data = await localTournamentService.getById(id as string);
            setTournament(data);
        } catch (e) {
            console.error('Failed to load tournament', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        load();
        // Auto-refresh every 30 seconds when tournament is ACTIVE
        pollRef.current = setInterval(() => load(true), 30000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [load]);

    const sportCode = tournament?.sport_code || 'DEFAULT';
    const scoreFields = SPORT_SCORE_FIELDS[sportCode] || SPORT_SCORE_FIELDS.DEFAULT;
    const colFields = SCOREBOARD_COLS[sportCode] || SCOREBOARD_COLS.DEFAULT;
    const colDefs = scoreFields.filter(sf => colFields.includes(sf.field));
    const sportIcon = SPORT_ICONS[sportCode] || SPORT_ICONS.DEFAULT;
    const isActive = tournament?.status === 'ACTIVE';

    const openEditModal = (participant: any) => {
        const initial: Record<string, string> = {};
        scoreFields.forEach(f => {
            initial[f.field] = String(participant.score?.[f.field] ?? '0');
        });
        setEditScores(initial);
        setEditModal({ visible: true, participant });
    };

    const saveScore = async () => {
        if (!editModal.participant) return;
        setSaving(true);
        try {
            const scoreObj: Record<string, number> = {};
            scoreFields.forEach(f => {
                scoreObj[f.field] = parseFloat(editScores[f.field]) || 0;
            });
            await localTournamentService.updateParticipantScore(id as string, editModal.participant.id, scoreObj);
            setEditModal({ visible: false, participant: null });
            load();
        } catch {
            Alert.alert('Error', 'Failed to update score.');
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        Alert.alert(
            'Close Tournament',
            'Are you sure you want to close this tournament? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Close Tournament', style: 'destructive',
                    onPress: async () => {
                        setClosing(true);
                        try {
                            await localTournamentService.close(id as string);
                            Alert.alert('Tournament Closed', 'The tournament has been marked as completed.');
                            router.back();
                        } catch (e: any) {
                            Alert.alert('Error', e.response?.data?.detail || 'Failed to close tournament.');
                        } finally {
                            setClosing(false);
                        }
                    }
                }
            ]
        );
    };

    const sortedParticipants = tournament?.participants
        ? [...tournament.participants].sort((a: any, b: any) => {
            const primaryField = colFields[0];
            const aScore = a.score?.[primaryField] ?? 0;
            const bScore = b.score?.[primaryField] ?? 0;
            return bScore - aScore;
        })
        : [];

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.brand.accent} />
            </SafeAreaView>
        );
    }

    if (!tournament) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: colors.text.muted }}>Tournament not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen }}>
            {/* Header */}
            <View style={{
                backgroundColor: colors.background.cardDark,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.sm }}>
                        <Text style={{ color: colors.brand.accent, fontSize: 22 }}>←</Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 26, marginRight: spacing.xs }}>{sportIcon}</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 17, fontWeight: '700',
                            color: colors.text.primary, fontFamily: typography.fontFamily,
                        }} numberOfLines={1}>
                            {tournament.name}
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 12, fontFamily: typography.fontFamily }}>
                            {tournament.sport_name} · {tournament.participants?.length || 0} Players
                        </Text>
                    </View>
                    {isActive ? <LivePulse /> : (
                        <View style={{
                            backgroundColor: '#64748b22', borderRadius: 20,
                            paddingHorizontal: 10, paddingVertical: 4,
                            borderWidth: 1, borderColor: '#64748b',
                        }}>
                            <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '700', fontFamily: typography.fontFamily }}>
                                {tournament.status}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Sport highlight label row */}
                <View style={{
                    flexDirection: 'row',
                    marginTop: spacing.xs,
                    gap: spacing.xs,
                    flexWrap: 'wrap',
                }}>
                    {colDefs.map(sf => (
                        <View key={sf.field} style={{
                            backgroundColor: (sf.color ?? colors.brand.accent) + '22',
                            borderRadius: radius.pill,
                            paddingHorizontal: spacing.sm,
                            paddingVertical: 3,
                            borderWidth: 1,
                            borderColor: (sf.color ?? colors.brand.accent) + '55',
                        }}>
                            <Text style={{ color: sf.color ?? colors.brand.accent, fontSize: 11, fontWeight: '600', fontFamily: typography.fontFamily }}>
                                {sf.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brand.accent} />}
                contentContainerStyle={{ padding: spacing.md }}
            >
                {/* Column Headers */}
                <View style={{ flexDirection: 'row', paddingHorizontal: spacing.xs, marginBottom: spacing.xs }}>
                    <Text style={{ width: 36, color: colors.text.muted, fontSize: 11, fontFamily: typography.fontFamily }}>RANK</Text>
                    <Text style={{ flex: 2, color: colors.text.muted, fontSize: 11, fontFamily: typography.fontFamily }}>PLAYER</Text>
                    {colDefs.map(sf => (
                        <Text key={sf.field} style={{ flex: 1, color: sf.color ?? colors.text.muted, fontSize: 11, textAlign: 'center', fontFamily: typography.fontFamily, fontWeight: '600' }}>
                            {sf.label.toUpperCase()}
                        </Text>
                    ))}
                    {isActive && <View style={{ width: 36 }} />}
                </View>

                {/* Participants */}
                {sortedParticipants.map((p: any, index: number) => {
                    const isTop = index === 0;
                    const rowBg = isTop ? '#92400e22' : colors.background.cardDark;
                    const borderC = isTop ? '#d97706' : colors.divider;

                    return (
                        <View
                            key={p.id}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: rowBg,
                                borderRadius: radius.lg,
                                padding: spacing.sm,
                                marginBottom: spacing.xs,
                                borderWidth: 1.5,
                                borderColor: borderC,
                            }}
                        >
                            {/* Rank */}
                            <View style={{ width: 36, alignItems: 'center' }}>
                                <Text style={{ fontSize: index < 3 ? 20 : 15, fontWeight: '700', color: colors.text.muted, fontFamily: typography.fontFamily }}>
                                    {rankLabel(index)}
                                </Text>
                            </View>

                            {/* Name */}
                            <View style={{ flex: 2, paddingRight: spacing.xs }}>
                                <Text style={{
                                    color: colors.text.primary, fontSize: 14, fontWeight: '600',
                                    fontFamily: typography.fontFamily,
                                }} numberOfLines={1}>
                                    {p.name}
                                </Text>
                                <Text style={{ color: colors.text.muted, fontSize: 11, fontFamily: typography.fontFamily }} numberOfLines={1}>
                                    {p.email}
                                </Text>
                            </View>

                            {/* Scores */}
                            {colDefs.map(sf => (
                                <Text key={sf.field} style={{
                                    flex: 1, textAlign: 'center',
                                    color: sf.color ?? colors.text.primary,
                                    fontSize: 17, fontWeight: '800',
                                    fontFamily: typography.fontFamily,
                                }}>
                                    {p.score?.[sf.field] ?? 0}
                                </Text>
                            ))}

                            {/* Edit button */}
                            {isActive && (
                                <TouchableOpacity
                                    onPress={() => openEditModal(p)}
                                    style={{ width: 36, alignItems: 'center' }}
                                >
                                    <Text style={{ fontSize: 18 }}>✏️</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}

                {sortedParticipants.length === 0 && (
                    <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
                        <Text style={{ color: colors.text.muted, fontFamily: typography.fontFamily }}>No participants found.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Close Tournament */}
            {isActive && (
                <View style={{
                    padding: spacing.md,
                    backgroundColor: colors.background.cardDark,
                    borderTopWidth: 1,
                    borderTopColor: colors.divider,
                }}>
                    <TouchableOpacity
                        onPress={handleClose}
                        disabled={closing}
                        style={{
                            backgroundColor: '#7f1d1d',
                            borderRadius: radius.md,
                            padding: spacing.md,
                            alignItems: 'center',
                        }}
                    >
                        {closing
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={{ color: '#fca5a5', fontWeight: '700', fontSize: 15, fontFamily: typography.fontFamily }}>
                                🏁 Close Tournament
                            </Text>
                        }
                    </TouchableOpacity>
                </View>
            )}

            {/* Edit Score Modal */}
            <Modal
                visible={editModal.visible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModal({ visible: false, participant: null })}
            >
                <View style={{ flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' }}>
                    <View style={{
                        backgroundColor: colors.background.cardDark,
                        borderTopLeftRadius: 24, borderTopRightRadius: 24,
                        padding: spacing.lg,
                    }}>
                        <Text style={{
                            fontSize: 17, fontWeight: '700',
                            color: colors.text.primary, fontFamily: typography.fontFamily,
                            marginBottom: spacing.md,
                        }}>
                            {sportIcon} Update Scores — {editModal.participant?.name}
                        </Text>

                        {/* All sport-specific fields */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
                            {scoreFields.map(sf => (
                                <View key={sf.field} style={{ width: '47%' }}>
                                    <Text style={{
                                        color: sf.color ?? colors.text.secondary,
                                        fontSize: 12,
                                        fontFamily: typography.fontFamily,
                                        marginBottom: 4,
                                        fontWeight: '600',
                                    }}>
                                        {sf.label}{sf.unit ? ` (${sf.unit.trim()})` : ''}
                                    </Text>
                                    <TextInput
                                        style={{
                                            backgroundColor: colors.background.screen,
                                            borderRadius: radius.md,
                                            borderWidth: 1,
                                            borderColor: (sf.color ?? colors.divider) + '99',
                                            color: colors.text.primary,
                                            paddingHorizontal: spacing.sm,
                                            paddingVertical: spacing.xs,
                                            fontSize: 20,
                                            fontFamily: typography.fontFamily,
                                            fontWeight: '800',
                                        }}
                                        keyboardType="numeric"
                                        value={editScores[sf.field] ?? '0'}
                                        onChangeText={v => setEditScores(prev => ({ ...prev, [sf.field]: v }))}
                                    />
                                </View>
                            ))}
                        </View>

                        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                            <TouchableOpacity
                                onPress={() => setEditModal({ visible: false, participant: null })}
                                style={{
                                    flex: 1, padding: spacing.md, borderRadius: radius.md,
                                    backgroundColor: colors.background.screen, alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: colors.text.secondary, fontWeight: '600', fontFamily: typography.fontFamily }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={saveScore}
                                disabled={saving}
                                style={{
                                    flex: 2, padding: spacing.md, borderRadius: radius.md,
                                    backgroundColor: colors.brand.accent, alignItems: 'center',
                                }}
                            >
                                {saving
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={{ color: '#fff', fontWeight: '700', fontFamily: typography.fontFamily }}>
                                        ✅ Save Scores
                                    </Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
