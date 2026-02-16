import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme/tokens';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
    return (
        <View style={{ marginBottom: spacing.md }}>
            {label && (
                <Text
                    style={{
                        color: colors.text.dark,
                        fontSize: typography.body.regular.size,
                        fontWeight: typography.body.large.weight,
                        fontFamily: typography.fontFamily,
                        marginBottom: spacing.xs,
                    }}
                >
                    {label}
                </Text>
            )}
            <TextInput
                style={[
                    {
                        height: 48,
                        backgroundColor: colors.background.card,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: error ? colors.status.error : colors.divider,
                        paddingHorizontal: spacing.md,
                        fontSize: typography.body.regular.size,
                        fontFamily: typography.fontFamily,
                        color: colors.text.dark,
                    },
                    style,
                ]}
                placeholderTextColor={colors.text.muted}
                {...props}
            />
            {error && (
                <Text
                    style={{
                        color: colors.status.error,
                        fontSize: typography.body.small.size,
                        fontFamily: typography.fontFamily,
                        marginTop: spacing.xxs,
                    }}
                >
                    {error}
                </Text>
            )}
        </View>
    );
};
