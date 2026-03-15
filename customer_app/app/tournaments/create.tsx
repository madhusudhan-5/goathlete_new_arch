import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { localTournamentService, scoreboardService } from '../../services/api';
import { colors, spacing, typography, radius } from '../../theme/tokens';

interface Participant {
    name: string;
    email: string;
    mobile: string;
}

const SPORT_ICONS: Record<string, string> = {
    CRICKET: '🏏',
    FOOTBALL: '⚽',
    TENNIS: '🎾',
    BADMINTON: '🏸',
    BASKETBALL: '🏀',
    VOLLEYBALL: '🏐',
    TABLE_TENNIS: '🏓',
    DEFAULT: '🏆',
};

export default function CreateTournamentScreen() {
    const router = useRouter();
    const [sports, setSports] = useState<any[]>([]);
    const [selectedSport, setSelectedSport] = useState<any>(null);
    const [tournamentName, setTournamentName] = useState('');
    const [participants, setParticipants] = useState<Participant[]>([
        { name: '', email: '', mobile: '' },
        { name: '', email: '', mobile: '' },
    ]);
    const [loading, setLoading] = useState(false);
    const [loadingSports, setLoadingSports] = useState(true);

    useEffect(() => {
        loadSports();
    }, []);

    const loadSports = async () => {
        try {
            const data = await scoreboardService.getSports();
            setSports(Array.isArray(data) ? data : data.results || []);
        } catch (e) {
            console.error('Failed to load sports', e);
        } finally {
            setLoadingSports(false);
        }
    };

    const addParticipant = () => {
        setParticipants([...participants, { name: '', email: '', mobile: '' }]);
    };

    const removeParticipant = (index: number) => {
        if (participants.length <= 2) {
            Alert.alert('Minimum Players', 'At least 2 participants are required.');
            return;
        }
        setParticipants(participants.filter((_, i) => i !== index));
    };

    const updateParticipant = (index: number, field: keyof Participant, value: string) => {
        const updated = [...participants];
        updated[index][field] = value;
        setParticipants(updated);
    };

    const validateForm = (): string | null => {
        if (!tournamentName.trim()) return 'Please enter a tournament name.';
        if (!selectedSport) return 'Please select a sport.';
        for (let i = 0; i < participants.length; i++) {
            const p = participants[i];
            if (!p.name.trim()) return `Participant ${i + 1}: Name is required.`;
            if (!p.email.trim() || !p.email.includes('@')) return `Participant ${i + 1}: Valid email is required.`;
            if (!p.mobile.trim() || p.mobile.length < 10) return `Participant ${i + 1}: Valid mobile number is required.`;
        }
        const emails = participants.map(p => p.email.toLowerCase());
        if (new Set(emails).size !== emails.length) return 'Duplicate email addresses are not allowed.';
        return null;
    };

    const handleCreate = async () => {
        const error = validateForm();
        if (error) {
            Alert.alert('Validation Error', error);
            return;
        }
        try {
            setLoading(true);
            const tournament = await localTournamentService.create({
                name: tournamentName.trim(),
                sport: selectedSport.id,
                participants: participants.map(p => ({
                    name: p.name.trim(),
                    email: p.email.trim().toLowerCase(),
                    mobile: p.mobile.trim(),
                })),
            });
            Alert.alert(
                '🏆 Tournament Created!',
                `"${tournament.name}" is now live.`,
                [{ text: 'View Scoreboard', onPress: () => router.replace(`/tournaments/scoreboard/${tournament.id}`) }]
            );
        } catch (e: any) {
            const msg = e.response?.data?.detail ||
                (typeof e.response?.data === 'object' ? JSON.stringify(e.response.data) : null) ||
                'Failed to create tournament.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        backgroundColor: colors.background.card || '#1e293b',
        borderRadius: radius.md || 10,
        borderWidth: 1,
        borderColor: colors.divider || '#334155',
        color: colors.text.primary || '#f1f5f9',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: 15,
        fontFamily: typography.fontFamily,
        marginBottom: spacing.xs,
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen || '#0f172a' }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider || '#1e293b',
                    backgroundColor: colors.background.cardDark || '#112B47',
                }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.md }}>
                        <Text style={{ color: colors.brand.accent, fontSize: 20 }}>←</Text>
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: typography.heading.h2?.size || 20,
                        fontWeight: '700',
                        color: colors.text.primary,
                        fontFamily: typography.fontFamily,
                    }}>
                        Create Tournament
                    </Text>
                </View>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>

                    {/* Tournament Name */}
                    <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6, fontFamily: typography.fontFamily }}>
                        Tournament Name
                    </Text>
                    <TextInput
                        style={inputStyle}
                        placeholder="e.g. Sunday Cricket Cup"
                        placeholderTextColor={colors.text.muted}
                        value={tournamentName}
                        onChangeText={setTournamentName}
                    />

                    {/* Sport Picker */}
                    <Text style={{ color: colors.text.secondary, fontSize: 13, marginTop: spacing.md, marginBottom: 8, fontFamily: typography.fontFamily }}>
                        Select Sport
                    </Text>
                    {loadingSports ? (
                        <ActivityIndicator color={colors.brand.accent} />
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                            {sports.map(sport => (
                                <TouchableOpacity
                                    key={sport.id}
                                    onPress={() => setSelectedSport(sport)}
                                    style={{
                                        backgroundColor: selectedSport?.id === sport.id
                                            ? colors.brand.accent
                                            : (colors.background.card || '#1e293b'),
                                        borderRadius: radius.md || 10,
                                        paddingHorizontal: spacing.md,
                                        paddingVertical: spacing.sm,
                                        marginRight: spacing.sm,
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: selectedSport?.id === sport.id
                                            ? colors.brand.accent
                                            : (colors.divider || '#334155'),
                                    }}
                                >
                                    <Text style={{ fontSize: 26, marginBottom: 4 }}>
                                        {SPORT_ICONS[sport.code] || SPORT_ICONS.DEFAULT}
                                    </Text>
                                    <Text style={{
                                        color: selectedSport?.id === sport.id ? '#fff' : colors.text.primary,
                                        fontSize: 12,
                                        fontFamily: typography.fontFamily,
                                        fontWeight: '600',
                                    }}>
                                        {sport.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    {/* Players / Participants */}
                    <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 6, fontFamily: typography.fontFamily }}>
                        Players ({participants.length})
                    </Text>

                    {participants.map((p, index) => (
                        <View key={index} style={{
                            backgroundColor: colors.background.card || '#1e293b',
                            borderRadius: radius.md || 10,
                            padding: spacing.md,
                            marginBottom: spacing.sm,
                            borderWidth: 1,
                            borderColor: colors.divider || '#334155',
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                                <Text style={{ color: colors.brand.accent, fontWeight: '700', fontFamily: typography.fontFamily }}>
                                    Player {index + 1}
                                </Text>
                                {index >= 2 && (
                                    <TouchableOpacity onPress={() => removeParticipant(index)}>
                                        <Text style={{ color: '#ef4444', fontWeight: '600' }}>Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TextInput
                                style={inputStyle}
                                placeholder="Full Name"
                                placeholderTextColor={colors.text.muted}
                                value={p.name}
                                onChangeText={v => updateParticipant(index, 'name', v)}
                            />
                            <TextInput
                                style={inputStyle}
                                placeholder="Email Address"
                                placeholderTextColor={colors.text.muted}
                                value={p.email}
                                onChangeText={v => updateParticipant(index, 'email', v)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={inputStyle}
                                placeholder="Mobile Number"
                                placeholderTextColor={colors.text.muted}
                                value={p.mobile}
                                onChangeText={v => updateParticipant(index, 'mobile', v)}
                                keyboardType="phone-pad"
                            />
                        </View>
                    ))}

                    {/* Add Player */}
                    <TouchableOpacity
                        onPress={addParticipant}
                        style={{
                            borderWidth: 1,
                            borderStyle: 'dashed',
                            borderColor: colors.brand.accent,
                            borderRadius: radius.md || 10,
                            padding: spacing.md,
                            alignItems: 'center',
                            marginBottom: spacing.xl,
                        }}
                    >
                        <Text style={{ color: colors.brand.accent, fontWeight: '600', fontFamily: typography.fontFamily, fontSize: 15 }}>
                            + Add Player
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Create Button */}
                <View style={{
                    padding: spacing.md,
                    backgroundColor: colors.background.cardDark || '#112B47',
                    borderTopWidth: 1,
                    borderTopColor: colors.divider || '#1e293b',
                }}>
                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={loading}
                        style={{
                            backgroundColor: loading ? '#555' : colors.brand.accent,
                            borderRadius: radius.md || 10,
                            padding: spacing.md,
                            alignItems: 'center',
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, fontFamily: typography.fontFamily }}>
                                🏆 Start Tournament
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
