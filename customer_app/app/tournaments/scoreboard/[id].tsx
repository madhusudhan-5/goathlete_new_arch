import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
    Alert, RefreshControl, TextInput, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { localTournamentService } from '../../../services/api';
import { colors, spacing, typography, radius } from '../../../theme/tokens';

// Sport-specific scoreboard config
const SPORT_SCORE_FIELDS: Record<string, { label: string; field: string; unit?: string }[]> = {
    CRICKET: [
        { label: 'Runs', field: 'runs' },
        { label: 'Wickets', field: 'wickets' },
        { label: 'Overs', field: 'overs', unit: ' ov' },
    ],
    FOOTBALL: [
        { label: 'Goals', field: 'goals' },
        { label: 'Assists', field: 'assists' },
    ],
    TENNIS: [
        { label: 'Sets', field: 'sets' },
        { label: 'Games', field: 'games' },
    ],
    BADMINTON: [
        { label: 'Points', field: 'points' },
        { label: 'Sets', field: 'sets' },
    ],
    BASKETBALL: [
        { label: 'Points', field: 'points' },
        { label: 'Rebounds', field: 'rebounds' },
        { label: 'Assists', field: 'assists' },
    ],
    VOLLEYBALL: [
        { label: 'Points', field: 'points' },
        { label: 'Sets', field: 'sets' },
    ],
    TABLE_TENNIS: [
        { label: 'Points', field: 'points' },
        { label: 'Sets', field: 'sets' },
    ],
    DEFAULT: [
        { label: 'Score', field: 'score' },
    ],
};

const SPORT_ICONS: Record<string, string> = {
    CRICKET: '🏏', FOOTBALL: '⚽', TENNIS: '🎾', BADMINTON: '🏸',
    BASKETBALL: '🏀', VOLLEYBALL: '🏐', TABLE_TENNIS: '🏓', DEFAULT: '🏆',
};

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

    const load = useCallback(async () => {
        try {
            const data = await localTournamentService.getById(id as string);
            setTournament(data);
        } catch (e) {
            console.error('Failed to load tournament', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const sportCode = tournament?.sport_code || 'DEFAULT';
    const scoreFields = SPORT_SCORE_FIELDS[sportCode] || SPORT_SCORE_FIELDS.DEFAULT;
    const sportIcon = SPORT_ICONS[sportCode] || SPORT_ICONS.DEFAULT;

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
        } catch (e) {
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
                    text: 'Close Tournament',
                    style: 'destructive',
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

    // Sort participants by primary score field descending
    const sortedParticipants = tournament?.participants
        ? [...tournament.participants].sort((a: any, b: any) => {
            const aScore = a.score?.[scoreFields[0]?.field] ?? 0;
            const bScore = b.score?.[scoreFields[0]?.field] ?? 0;
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
                padding: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.divider,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
                        <Text style={{ color: colors.brand.accent, fontSize: 20 }}>←</Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 22, marginRight: spacing.sm }}>{sportIcon}</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 18, fontWeight: '700',
                            color: colors.text.primary, fontFamily: typography.fontFamily,
                        }}>
                            {tournament.name}
                        </Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 12, fontFamily: typography.fontFamily }}>
                            {tournament.sport_name} • {tournament.participants?.length || 0} Players
                        </Text>
                    </View>
                    {/* Status badge */}
                    <View style={{
                        backgroundColor: tournament.status === 'ACTIVE' ? '#16a34a22' : '#64748b22',
                        borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
                        borderWidth: 1,
                        borderColor: tournament.status === 'ACTIVE' ? '#16a34a' : '#64748b',
                    }}>
                        <Text style={{
                            color: tournament.status === 'ACTIVE' ? '#4ade80' : '#94a3b8',
                            fontSize: 11, fontWeight: '700', fontFamily: typography.fontFamily,
                        }}>
                            {tournament.status}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.brand.accent} />}
                contentContainerStyle={{ padding: spacing.md }}
            >
                {/* Score Fields Header */}
                <View style={{
                    flexDirection: 'row',
                    paddingHorizontal: spacing.sm,
                    marginBottom: spacing.xs,
                }}>
                    <Text style={{ flex: 1, color: colors.text.muted, fontSize: 12, fontFamily: typography.fontFamily }}>RANK</Text>
                    <Text style={{ flex: 2, color: colors.text.muted, fontSize: 12, fontFamily: typography.fontFamily }}>PLAYER</Text>
                    {scoreFields.map(sf => (
                        <Text key={sf.field} style={{ flex: 1, color: colors.text.muted, fontSize: 12, textAlign: 'center', fontFamily: typography.fontFamily }}>
                            {sf.label.toUpperCase()}
                        </Text>
                    ))}
                    {tournament.status === 'ACTIVE' && (
                        <View style={{ width: 36 }} />
                    )}
                </View>

                {/* Participants */}
                {sortedParticipants.map((p: any, index: number) => (
                    <View
                        key={p.id}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: index === 0 ? '#92400e22' : (colors.background.card || '#1e293b'),
                            borderRadius: radius.md || 10,
                            padding: spacing.sm,
                            marginBottom: spacing.xs,
                            borderWidth: 1,
                            borderColor: index === 0 ? '#d97706' : (colors.divider || '#334155'),
                        }}
                    >
                        {/* Rank */}
                        <Text style={{
                            flex: 1,
                            fontSize: 16,
                            fontWeight: '700',
                            color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : colors.text.muted,
                            fontFamily: typography.fontFamily,
                        }}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </Text>

                        {/* Name */}
                        <View style={{ flex: 2 }}>
                            <Text style={{
                                color: colors.text.primary, fontSize: 14, fontWeight: '600',
                                fontFamily: typography.fontFamily,
                            }} numberOfLines={1}>
                                {p.name}
                            </Text>
                            <Text style={{ color: colors.text.muted, fontSize: 11, fontFamily: typography.fontFamily }} numberOfLines={1}>
                                {p.mobile}
                            </Text>
                        </View>

                        {/* Scores */}
                        {scoreFields.map(sf => (
                            <Text key={sf.field} style={{
                                flex: 1, textAlign: 'center',
                                color: colors.text.primary,
                                fontSize: 16, fontWeight: '700',
                                fontFamily: typography.fontFamily,
                            }}>
                                {p.score?.[sf.field] ?? '-'}
                            </Text>
                        ))}

                        {/* Edit button (only when tournament is active) */}
                        {tournament.status === 'ACTIVE' && (
                            <TouchableOpacity
                                onPress={() => openEditModal(p)}
                                style={{ width: 36, alignItems: 'center' }}
                            >
                                <Text style={{ fontSize: 18 }}>✏️</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                {sortedParticipants.length === 0 && (
                    <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
                        <Text style={{ color: colors.text.muted, fontFamily: typography.fontFamily }}>No participants found.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Close Tournament Button */}
            {tournament.status === 'ACTIVE' && (
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
                            borderRadius: radius.md || 10,
                            padding: spacing.md,
                            alignItems: 'center',
                        }}
                    >
                        {closing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: '#fca5a5', fontWeight: '700', fontSize: 15, fontFamily: typography.fontFamily }}>
                                🏁 Close Tournament
                            </Text>
                        )}
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
                        backgroundColor: colors.background.cardDark || '#112B47',
                        borderTopLeftRadius: 20, borderTopRightRadius: 20,
                        padding: spacing.lg,
                    }}>
                        <Text style={{
                            fontSize: 18, fontWeight: '700',
                            color: colors.text.primary, fontFamily: typography.fontFamily,
                            marginBottom: spacing.md,
                        }}>
                            Update Scores — {editModal.participant?.name}
                        </Text>

                        {scoreFields.map(sf => (
                            <View key={sf.field} style={{ marginBottom: spacing.sm }}>
                                <Text style={{ color: colors.text.secondary, fontSize: 13, fontFamily: typography.fontFamily, marginBottom: 4 }}>
                                    {sf.label}
                                </Text>
                                <TextInput
                                    style={{
                                        backgroundColor: colors.background.card || '#1e293b',
                                        borderRadius: radius.md || 10,
                                        borderWidth: 1,
                                        borderColor: colors.divider || '#334155',
                                        color: colors.text.primary,
                                        padding: spacing.sm,
                                        fontSize: 18,
                                        fontFamily: typography.fontFamily,
                                        fontWeight: '700',
                                    }}
                                    keyboardType="numeric"
                                    value={editScores[sf.field] ?? '0'}
                                    onChangeText={v => setEditScores(prev => ({ ...prev, [sf.field]: v }))}
                                />
                            </View>
                        ))}

                        <View style={{ flexDirection: 'row', gap: 12, marginTop: spacing.sm }}>
                            <TouchableOpacity
                                onPress={() => setEditModal({ visible: false, participant: null })}
                                style={{
                                    flex: 1, padding: spacing.md, borderRadius: radius.md,
                                    backgroundColor: colors.background.card || '#1e293b',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ color: colors.text.secondary, fontWeight: '600', fontFamily: typography.fontFamily }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={saveScore}
                                disabled={saving}
                                style={{
                                    flex: 1, padding: spacing.md, borderRadius: radius.md,
                                    backgroundColor: colors.brand.accent,
                                    alignItems: 'center',
                                }}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={{ color: '#fff', fontWeight: '700', fontFamily: typography.fontFamily }}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
