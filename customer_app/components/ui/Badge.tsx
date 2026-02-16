import React from 'react';
import { View, Text } from 'react-native';
import { colors, typography, radius, spacing } from '../../theme/tokens';

interface BadgeProps {
    variant: 'onlineBooked' | 'offlineBooked' | 'blocked' | 'success' | 'warning' | 'error' | 'info';
    children: React.ReactNode;
    size?: 'small' | 'medium';
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, size = 'medium' }) => {
    const getBackgroundColor = () => {
        switch (variant) {
            case 'onlineBooked':
                return colors.status.onlineBooked;
            case 'offlineBooked':
                return colors.status.offlineBooked;
            case 'blocked':
                return colors.status.blocked;
            case 'success':
                return colors.status.success;
            case 'warning':
                return colors.status.warning;
            case 'error':
                return colors.status.error;
            case 'info':
                return colors.status.info;
            default:
                return colors.status.info;
        }
    };

    const getFontSize = () => {
        return size === 'small' ? typography.body.small.size : typography.body.regular.size;
    };

    const getPadding = () => {
        return size === 'small' ? { horizontal: spacing.xs, vertical: spacing.xxs } : { horizontal: spacing.sm, vertical: spacing.xs };
    };

    const padding = getPadding();

    return (
        <View
            style={{
                backgroundColor: getBackgroundColor(),
                paddingHorizontal: padding.horizontal,
                paddingVertical: padding.vertical,
                borderRadius: radius.pill,
                alignSelf: 'flex-start',
            }}
        >
            <Text
                style={{
                    color: colors.text.primary,
                    fontSize: getFontSize(),
                    fontWeight: typography.body.large.weight,
                    fontFamily: typography.fontFamily,
                }}
            >
                {children}
            </Text>
        </View>
    );
};
