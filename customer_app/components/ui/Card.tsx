import React from 'react';
import { View, ViewStyle } from 'react-native';
import { colors, spacing, radius, shadows } from '../../theme/tokens';

interface CardProps {
    children: React.ReactNode;
    variant?: 'light' | 'dark';
    padding?: keyof typeof spacing;
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'light',
    padding = 'md',
    style,
}) => {
    return (
        <View
            style={[
                {
                    backgroundColor: variant === 'light' ? colors.background.card : colors.background.cardDark,
                    borderRadius: radius.lg,
                    padding: spacing[padding],
                    ...shadows.card,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
};
