import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { colors, spacing, typography, radius } from '../../theme/tokens';
import { MapPin, Star } from 'lucide-react-native';

interface VenueCardProps {
    venue: {
        id: number;
        name: string;
        city: string;
        address?: string;
        image?: string;
        rating?: number;
        distance?: string;
    };
    onPress: () => void;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card padding="sm" style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    {/* Venue Image */}
                    {venue.image ? (
                        <Image
                            source={{ uri: venue.image }}
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: radius.md,
                                backgroundColor: colors.background.cardDark,
                            }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: radius.md,
                                backgroundColor: colors.background.cardDark,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <MapPin size={32} color={colors.brand.accent} />
                        </View>
                    )}

                    {/* Venue Info */}
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                        <View>
                            <Text
                                style={{
                                    fontSize: typography.heading.h3.size,
                                    fontWeight: typography.heading.h3.weight,
                                    color: colors.text.dark,
                                    fontFamily: typography.fontFamily,
                                    marginBottom: spacing.xxs,
                                }}
                                numberOfLines={1}
                            >
                                {venue.name}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
                                <MapPin size={14} color={colors.text.muted} />
                                <Text
                                    style={{
                                        fontSize: typography.body.small.size,
                                        color: colors.text.muted,
                                        fontFamily: typography.fontFamily,
                                    }}
                                    numberOfLines={1}
                                >
                                    {venue.city}
                                </Text>
                            </View>
                        </View>

                        {/* Rating & Distance */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                            {venue.rating && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xxs }}>
                                    <Star size={14} color={colors.status.warning} fill={colors.status.warning} />
                                    <Text
                                        style={{
                                            fontSize: typography.body.small.size,
                                            color: colors.text.dark,
                                            fontWeight: typography.body.large.weight,
                                            fontFamily: typography.fontFamily,
                                        }}
                                    >
                                        {venue.rating.toFixed(1)}
                                    </Text>
                                </View>
                            )}
                            {venue.distance && (
                                <Text
                                    style={{
                                        fontSize: typography.body.small.size,
                                        color: colors.text.muted,
                                        fontFamily: typography.fontFamily,
                                    }}
                                >
                                    {venue.distance}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
};
