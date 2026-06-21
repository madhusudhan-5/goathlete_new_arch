import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, SafeAreaView, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Keyboard,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import { authService } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';
import { LOG_API_CALLS } from '../../config/env';

export default function OTPScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { phone } = route.params as { phone: string };
  const { setIsLoggedIn } = useAuthContext();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<TextInput[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-verify when all 6 digits entered
    if (value && index === 5) {
      const fullOtp = [...newOtp].join('');
      if (fullOtp.length === 6) {
        Keyboard.dismiss();
        setTimeout(() => verifyOtp(fullOtp), 100);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (otpString?: string) => {
    const code = otpString || otp.join('');
    if (code.length < 6) {
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtp(phone, code);
      if (LOG_API_CALLS) console.log('[DEV] OTP verified — navigating to app');
      setIsLoggedIn(true); // triggers switch from AuthStack → DrawerNavigator
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Verification Failed', msg);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      const response = await authService.sendOtp(phone);
      if (LOG_API_CALLS && response.otp) {
        console.log(`[DEV] Resent OTP: ${response.otp}`);
        Alert.alert('DEV MODE — OTP', `New OTP: ${response.otp}`);
      }
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const maskedPhone = phone.slice(0, -4).replace(/\d/g, '•') + phone.slice(-4);

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <View className="flex-1 px-6 pt-6">

        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-8">
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Header */}
        <View className="mb-10">
          <Text className="text-white text-3xl font-bold mb-2">Verify OTP</Text>
          <Text className="text-[#94a3b8] text-sm leading-6">
            Enter the 6-digit code sent to{'\n'}
            <Text className="text-[#DA6F2B] font-semibold">{maskedPhone}</Text>
          </Text>
        </View>

        {/* OTP Boxes */}
        <View className="flex-row justify-between mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { if (ref) inputRefs.current[index] = ref; }}
              value={digit}
              onChangeText={value => handleOtpChange(value.slice(-1), index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={index === 0}
              style={{
                width: 48,
                height: 56,
                backgroundColor: digit ? '#DA6F2B' : '#112B47',
                borderWidth: 1.5,
                borderColor: digit ? '#DA6F2B' : '#1e3a5f',
                borderRadius: 12,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 'bold',
                color: '#FFFFFF',
              }}
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          onPress={() => verifyOtp()}
          disabled={loading || otp.join('').length < 6}
          className="bg-[#DA6F2B] rounded-xl py-4 items-center mb-6"
          style={{ opacity: (loading || otp.join('').length < 6) ? 0.6 : 1 }}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Verify & Continue</Text>
          )}
        </TouchableOpacity>

        {/* Resend */}
        <View className="flex-row items-center justify-center">
          <RotateCcw size={14} color="#64748b" />
          {countdown > 0 ? (
            <Text className="text-[#64748b] ml-2 text-sm">
              Resend OTP in <Text className="text-[#DA6F2B] font-semibold">{countdown}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending} className="ml-2">
              {resending ? (
                <ActivityIndicator size="small" color="#DA6F2B" />
              ) : (
                <Text className="text-[#DA6F2B] font-semibold text-sm">Resend OTP</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Wrong number */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 items-center"
        >
          <Text className="text-[#64748b] text-xs">Wrong number? Go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
