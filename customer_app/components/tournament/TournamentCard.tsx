import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { colors, spacing, typography } from '../../theme/tokens';
import { Calendar, MapPin, Users } from 'lucide-react-native';

interface TournamentCardProps {
    tournament: {
        id: string;
        name: string;
        sport: string;
        start_date: string;
        end_date?: string;
        venue_name?: string;
        tournament_type: string;
        entry_fee?: number;
        status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
    };
    onPress: () => void;
    onRegister?: () => void;
    onViewBracket?: () => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
    tournament,
    onPress,
    onRegister,
    onViewBracket,
}) => {
    const getSportIcon = (sport: string) => {
        const icons: any = {
            'Badminton': '🏸',
            'Tennis': '🎾',
            'Cricket': '🏏',
            'Football': '⚽',
            'Basketball': '🏀',
            'Squash': '🎾'
        };
        return icons[sport] || '🏆';
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'UPCOMING':
                return 'info';
            case 'ONGOING':
                return 'success';
            case 'COMPLETED':
                return 'info';
            default:
                return 'info';
        }
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ marginBottom: spacing.md }}>
            <Card padding="md">
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: typography.heading.h3.size,
                                fontWeight: typography.heading.h3.weight,
                                color: colors.text.dark,
                                fontFamily: typography.fontFamily,
                                marginBottom: spacing.xxs,
                            }}
                            numberOfLines={2}
                        >
                            {tournament.name}
                        </Text>
                        <Text
                            style={{
                                fontSize: typography.body.regular.size,
                                color: colors.text.muted,
                                fontFamily: typography.fontFamily,
                            }}
                        >
                            {getSportIcon(tournament.sport)} {tournament.sport}
                        </Text>
                    </View>
                    <Badge variant={getStatusVariant(tournament.status)} size="small">
                        {tournament.status}
                    </Badge>
                </View>

                {/* Tournament Info */}
                <View style={{ backgroundColor: colors.background.cardDark + '20', padding: spacing.sm, borderRadius: 10, marginBottom: spacing.sm }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <Calendar size={14} color={colors.text.muted} />
                            <Text style={{ fontSize: typography.body.small.size, color: colors.text.muted, fontFamily: typography.fontFamily }}>
                                Start Date
                            </Text>
                        </View>
                        <Text style={{ fontSize: typography.body.small.size, fontWeight: typography.body.large.weight, color: colors.text.dark, fontFamily: typography.fontFamily }}>
                            {new Date(tournament.start_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                            })}
                        </Text>
                    </View>

                    {tournament.venue_name && (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                                <MapPin size={14} color={colors.text.muted} />
                                <Text style={{ fontSize: typography.body.small.size, color: colors.text.muted, fontFamily: typography.fontFamily }}>
                                    Venue
                                </Text>
                            </View>
                            <Text style={{ fontSize: typography.body.small.size, fontWeight: typography.body.large.weight, color: colors.text.dark, fontFamily: typography.fontFamily }} numberOfLines={1}>
                                {tournament.venue_name}
                            </Text>
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                            <Users size={14} color={colors.text.muted} />
                            <Text style={{ fontSize: typography.body.small.size, color: colors.text.muted, fontFamily: typography.fontFamily }}>
                                Format
                            </Text>
                        </View>
                        <Text style={{ fontSize: typography.body.small.size, fontWeight: typography.body.large.weight, color: colors.text.dark, fontFamily: typography.fontFamily }}>
                            {tournament.tournament_type}
                        </Text>
                    </View>
                </View>

                {/* Entry Fee & CTA */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.divider }}>
                    <View>
                        <Text style={{ fontSize: typography.body.small.size, color: colors.text.muted, fontFamily: typography.fontFamily }}>
                            Entry Fee
                        </Text>
                        <Text style={{ fontSize: typography.body.large.size, fontWeight: typography.body.large.weight, color: colors.brand.accent, fontFamily: typography.fontFamily }}>
                            {tournament.entry_fee ? `₹${tournament.entry_fee}` : 'Free'}
                        </Text>
                    </View>

                    {tournament.status === 'UPCOMING' && onRegister && (
                        <Button variant="primary" size="small" onPress={onRegister}>
                            Register
                        </Button>
                    )}

                    {tournament.status === 'ONGOING' && onViewBracket && (
                        <Button variant="secondary" size="small" onPress={onViewBracket}>
                            View Bracket
                        </Button>
                    )}
                </View>
            </Card>
        </TouchableOpacity>
    );
};
