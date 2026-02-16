import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme/tokens';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    onPress: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    onPress,
    children,
    disabled = false,
    loading = false,
    fullWidth = false,
}) => {
    const getBackgroundColor = () => {
        if (disabled) return colors.text.muted;
        switch (variant) {
            case 'primary':
                return colors.brand.accent;
            case 'secondary':
                return colors.background.cardDark;
            case 'ghost':
                return 'transparent';
            default:
                return colors.brand.accent;
        }
    };

    const getTextColor = () => {
        if (disabled) return colors.text.secondary;
        switch (variant) {
            case 'primary':
            case 'secondary':
                return colors.text.primary;
            case 'ghost':
                return colors.brand.accent;
            default:
                return colors.text.primary;
        }
    };

    const getHeight = () => {
        switch (size) {
            case 'small':
                return 36;
            case 'medium':
                return 48;
            case 'large':
                return 56;
            default:
                return 48;
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'small':
                return typography.body.small.size;
            case 'medium':
                return typography.body.regular.size;
            case 'large':
                return typography.body.large.size;
            default:
                return typography.body.regular.size;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={{
                backgroundColor: getBackgroundColor(),
                height: getHeight(),
                borderRadius: radius.md,
                paddingHorizontal: spacing.lg,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                width: fullWidth ? '100%' : undefined,
                borderWidth: variant === 'ghost' ? 1 : 0,
                borderColor: variant === 'ghost' ? colors.brand.accent : 'transparent',
            }}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <Text
                    style={{
                        color: getTextColor(),
                        fontSize: getFontSize(),
                        fontWeight: typography.body.large.weight,
                        fontFamily: typography.fontFamily,
                    }}
                >
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
};
