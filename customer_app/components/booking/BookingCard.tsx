import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { colors, spacing, typography } from '../../theme/tokens';
import { Calendar, Clock, MapPin } from 'lucide-react-native';

interface BookingCardProps {
    booking: {
        id: number;
        court_name: string;
        venue_name: string;
        booking_date: string;
        start_time: string;
        duration_hours: number;
        total_amount: number;
        status: string;
        booking_type: 'ONLINE' | 'OFFLINE';
    };
    onPress?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
    const getStatusVariant = (status: string) => {
        switch (status.toUpperCase()) {
            case 'CONFIRMED':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'CANCELLED':
                return 'error';
            case 'COMPLETED':
                return 'info';
            default:
                return 'info';
        }
    };

    const getBookingTypeVariant = (type: string) => {
        return type === 'ONLINE' ? 'onlineBooked' : 'offlineBooked';
    };

    const CardWrapper = onPress ? TouchableOpacity : View;

    return (
        <CardWrapper onPress={onPress} activeOpacity={0.7} style={{ marginBottom: spacing.md }}>
            <Card padding="md">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                    <Text
                        style={{
                            fontSize: typography.heading.h3.size,
                            fontWeight: typography.heading.h3.weight,
                            color: colors.text.dark,
                            fontFamily: typography.fontFamily,
                            flex: 1,
                        }}
                        numberOfLines={1}
                    >
                        {booking.court_name}
                    </Text>
                    <Badge variant={getStatusVariant(booking.status)} size="small">
                        {booking.status}
                    </Badge>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                    <MapPin size={14} color={colors.text.muted} />
                    <Text
                        style={{
                            fontSize: typography.body.regular.size,
                            color: colors.text.muted,
                            fontFamily: typography.fontFamily,
                        }}
                    >
                        {booking.venue_name}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs }}>
                    <Calendar size={14} color={colors.text.muted} />
                    <Text
                        style={{
                            fontSize: typography.body.regular.size,
                            color: colors.text.dark,
                            fontFamily: typography.fontFamily,
                        }}
                    >
                        {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.md }}>
                    <Clock size={14} color={colors.text.muted} />
                    <Text
                        style={{
                            fontSize: typography.body.regular.size,
                            color: colors.text.dark,
                            fontFamily: typography.fontFamily,
                        }}
                    >
                        {booking.start_time} • {booking.duration_hours}hr
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge variant={getBookingTypeVariant(booking.booking_type)} size="small">
                        {booking.booking_type}
                    </Badge>
                    <Text
                        style={{
                            fontSize: typography.body.large.size,
                            fontWeight: typography.body.large.weight,
                            color: colors.brand.accent,
                            fontFamily: typography.fontFamily,
                        }}
                    >
                        ₹{booking.total_amount}
                    </Text>
                </View>
            </Card>
        </CardWrapper>
    );
};
