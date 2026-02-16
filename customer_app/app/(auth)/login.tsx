import React, { useState } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Smartphone } from 'lucide-react-native';
import { authService } from '../../services/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { colors, spacing, typography } from '../../theme/tokens';

export default function LoginScreen() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSendOtp = async () => {
        setError('');

        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number');
            return;
        }

        // Format phone number (assuming India for now, but should be dynamic)
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

        setLoading(true);
        try {
            const response = await authService.sendOtp(formattedPhone);
            if (response.success) {
                router.push({
                    pathname: '/(auth)/otp',
                    params: { phone: formattedPhone }
                });
            } else {
                setError(response.message || 'Failed to send OTP');
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to connect to server';
            setError(msg);
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
                <View style={{ flex: 1, paddingHorizontal: spacing.lg, justifyContent: 'center' }}>
                    {/* Logo/Branding */}
                    <View style={{ marginBottom: spacing.xxl, alignItems: 'center' }}>
                        <View style={{
                            width: 80,
                            height: 80,
                            backgroundColor: colors.brand.accent,
                            borderRadius: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginBottom: spacing.lg
                        }}>
                            <Text style={{ fontSize: 40 }}>🏟️</Text>
                        </View>
                        <Text style={{
                            fontSize: typography.heading.h1.size,
                            fontWeight: typography.heading.h1.weight,
                            color: colors.text.primary,
                            fontFamily: typography.fontFamily,
                            marginBottom: spacing.xs
                        }}>
                            GoAthlete
                        </Text>
                        <Text style={{
                            color: colors.text.secondary,
                            fontSize: typography.body.large.size,
                            fontFamily: typography.fontFamily,
                            textAlign: 'center'
                        }}>
                            Welcome back!
                        </Text>
                        <Text style={{
                            color: colors.text.muted,
                            fontSize: typography.body.regular.size,
                            fontFamily: typography.fontFamily,
                            textAlign: 'center'
                        }}>
                            Enter your mobile number to login
                        </Text>
                    </View>

                    {/* Login Card */}
                    <Card padding="lg">
                        <View style={{ marginBottom: spacing.md }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                                <Smartphone size={20} color={colors.text.dark} style={{ marginRight: spacing.xs }} />
                                <Text style={{
                                    color: colors.text.dark,
                                    fontWeight: typography.body.large.weight,
                                    fontSize: typography.body.regular.size,
                                    fontFamily: typography.fontFamily
                                }}>
                                    Mobile Number
                                </Text>
                            </View>
                            <Input
                                placeholder="9876543210"
                                keyboardType="phone-pad"
                                value={phoneNumber}
                                onChangeText={(text) => {
                                    setPhoneNumber(text);
                                    setError('');
                                }}
                                error={error}
                            />
                        </View>

                        <Button
                            variant="primary"
                            size="large"
                            fullWidth
                            onPress={handleSendOtp}
                            loading={loading}
                            disabled={loading}
                        >
                            Get OTP
                        </Button>
                    </Card>

                    {/* Terms */}
                    <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
                        <Text style={{
                            color: colors.text.muted,
                            textAlign: 'center',
                            fontSize: typography.body.small.size,
                            fontFamily: typography.fontFamily,
                            lineHeight: 18
                        }}>
                            By continuing, you agree to our{'\n'}
                            <Text style={{ color: colors.brand.accent }}>Terms of Service</Text> and <Text style={{ color: colors.brand.accent }}>Privacy Policy</Text>
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
