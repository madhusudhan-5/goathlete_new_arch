import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { authService } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, typography, radius } from '../../theme/tokens';

export default function OtpScreen() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);
    const [error, setError] = useState('');
    const router = useRouter();
    const { phone } = useLocalSearchParams();

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerifyOtp = async () => {
        setError('');

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.verifyOtp(phone as string, otp);
            if (response.success) {
                // Navigate to tabs/home and replace history so back button exits app
                router.replace('/(tabs)');
            } else {
                setError(response.message || 'Invalid OTP');
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Verification failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await authService.sendOtp(phone as string);
            if (response.success) {
                setTimer(30);
            } else {
                setError(response.message || 'Failed to resend OTP');
            }
        } catch (error: any) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.screen }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={{ flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl }}>
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: spacing.xl,
                            gap: spacing.xs
                        }}
                    >
                        <ArrowLeft size={20} color={colors.brand.accent} />
                        <Text style={{
                            color: colors.brand.accent,
                            fontWeight: typography.body.large.weight,
                            fontSize: typography.body.regular.size,
                            fontFamily: typography.fontFamily
                        }}>
                            Back
                        </Text>
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={{ marginBottom: spacing.xxl }}>
                        <Text style={{
                            fontSize: typography.heading.h1.size,
                            fontWeight: typography.heading.h1.weight,
                            color: colors.text.primary,
                            fontFamily: typography.fontFamily,
                            marginBottom: spacing.xs
                        }}>
                            Enter OTP
                        </Text>
                        <Text style={{
                            color: colors.text.secondary,
                            fontSize: typography.body.regular.size,
                            fontFamily: typography.fontFamily
                        }}>
                            We sent a code to{' '}
                            <Text style={{ fontWeight: typography.body.large.weight, color: colors.text.primary }}>
                                {phone}
                            </Text>
                            {' '}via WhatsApp.
                        </Text>
                    </View>

                    {/* OTP Card */}
                    <Card padding="lg">
                        <View style={{ marginBottom: spacing.lg }}>
                            <TextInput
                                style={{
                                    width: '100%',
                                    backgroundColor: colors.background.cardDark + '20',
                                    padding: spacing.md,
                                    borderRadius: radius.md,
                                    borderWidth: 1,
                                    borderColor: error ? colors.status.error : colors.divider,
                                    fontSize: 24,
                                    textAlign: 'center',
                                    letterSpacing: 12,
                                    fontWeight: typography.heading.h2.weight,
                                    color: colors.text.dark,
                                    fontFamily: typography.fontFamily
                                }}
                                placeholder="• • • • • •"
                                placeholderTextColor={colors.text.muted}
                                keyboardType="number-pad"
                                maxLength={6}
                                value={otp}
                                onChangeText={(text) => {
                                    setOtp(text);
                                    setError('');
                                }}
                                editable={!loading}
                                autoFocus
                            />
                            {error && (
                                <Text style={{
                                    color: colors.status.error,
                                    fontSize: typography.body.small.size,
                                    fontFamily: typography.fontFamily,
                                    marginTop: spacing.xs,
                                    textAlign: 'center'
                                }}>
                                    {error}
                                </Text>
                            )}
                        </View>

                        <Button
                            variant="primary"
                            size="large"
                            fullWidth
                            onPress={handleVerifyOtp}
                            loading={loading}
                            disabled={loading}
                        >
                            Verify & Login
                        </Button>

                        {/* Resend OTP */}
                        <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
                            {timer > 0 ? (
                                <Text style={{
                                    color: colors.text.muted,
                                    fontSize: typography.body.regular.size,
                                    fontFamily: typography.fontFamily
                                }}>
                                    Resend code in {timer}s
                                </Text>
                            ) : (
                                <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
                                    <Text style={{
                                        color: colors.brand.accent,
                                        fontWeight: typography.body.large.weight,
                                        fontSize: typography.body.regular.size,
                                        fontFamily: typography.fontFamily
                                    }}>
                                        Resend OTP
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </Card>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
