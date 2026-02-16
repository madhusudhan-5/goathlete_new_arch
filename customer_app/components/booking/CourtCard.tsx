import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { colors, spacing, typography } from '../../theme/tokens';

interface CourtCardProps {
    court: {
        id: number;
        name: string;
        sport: string;
        surface_type?: string;
        is_active: boolean;
        price_per_hour?: number;
    };
    onPress?: () => void;
    selectable?: boolean;
    selected?: boolean;
}

export const CourtCard: React.FC<CourtCardProps> = ({
    court,
    onPress,
    selectable = false,
    selected = false,
}) => {
    const CardWrapper = selectable && onPress ? TouchableOpacity : View;

    return (
        <CardWrapper
            onPress={onPress}
            activeOpacity={0.7}
            style={{ marginBottom: spacing.md }}
        >
            <Card
                padding="md"
                style={{
                    borderWidth: selected ? 2 : 0,
                    borderColor: selected ? colors.brand.accent : 'transparent',
                }}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{
                                fontSize: typography.heading.h3.size,
                                fontWeight: typography.heading.h3.weight,
                                color: colors.text.dark,
                                fontFamily: typography.fontFamily,
                                marginBottom: spacing.xs,
                            }}
                        >
                            {court.name}
                        </Text>

                        <View style={{ flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xs }}>
                            <Badge variant="info" size="small">
                                {court.sport}
                            </Badge>
                            {court.surface_type && (
                                <Badge variant="info" size="small">
                                    {court.surface_type}
                                </Badge>
                            )}
                        </View>

                        {court.price_per_hour && (
                            <Text
                                style={{
                                    fontSize: typography.body.large.size,
                                    fontWeight: typography.body.large.weight,
                                    color: colors.brand.accent,
                                    fontFamily: typography.fontFamily,
                                }}
                            >
                                ₹{court.price_per_hour}/hr
                            </Text>
                        )}
                    </View>

                    <Badge variant={court.is_active ? 'success' : 'error'} size="small">
                        {court.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </View>
            </Card>
        </CardWrapper>
    );
};
