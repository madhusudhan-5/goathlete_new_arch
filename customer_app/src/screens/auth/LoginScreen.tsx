import React, { useState } from 'react';
import {
  View, Text, SafeAreaView, KeyboardAvoidingView,
  Platform, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Smartphone, ArrowRight } from 'lucide-react-native';
import { authService } from '../../services/api';
import { GOOGLE_CONFIG, LOG_API_CALLS } from '../../config/env';
import { useAuthContext } from '../../context/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setIsLoggedIn } = useAuthContext();

  // ─── Phone OTP Login ───────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }
    const formatted = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    setLoading(true);
    try {
      const response = await authService.sendOtp(formatted);
      if (response.success) {
        navigation.navigate('OTP', { phone: formatted });
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
      // DEV: also show OTP in console
      if (LOG_API_CALLS && response.otp) {
        console.log(`[DEV] OTP for ${formatted}: ${response.otp}`);
        Alert.alert('DEV MODE — OTP', `Your OTP: ${response.otp}`);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to connect. Check your internet.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Google Sign-In ────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      if (LOG_API_CALLS) {
        // DEV: Mock Google Sign-In — shows alert instead of real OAuth
        Alert.alert(
          'DEV MODE — Google Sign-In',
          'Real Google Sign-In will work once you add your Google OAuth Client IDs in src/config/env.ts',
        );
        setGoogleLoading(false);
        return;
      }

      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      GoogleSignin.configure({
        webClientId: GOOGLE_CONFIG.webClientId,
        iosClientId: GOOGLE_CONFIG.iosClientId,
        offlineAccess: false,
      });

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) throw new Error('No ID token received from Google');

      await authService.googleSignIn(idToken);
      setIsLoggedIn(true);
    } catch (error: any) {
      if (error.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('Google Sign-In Failed', error.message || 'Please try again');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 justify-center">

          {/* ─── Branding ─────────────────────────────────────────────── */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 rounded-full bg-[#DA6F2B] items-center justify-center mb-4 shadow-lg"
              style={{ shadowColor: '#DA6F2B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 }}>
              <Text style={{ fontSize: 38 }}>🏟️</Text>
            </View>
            <Text className="text-white text-3xl font-bold mb-1">GoAthlete</Text>
            <Text className="text-[#94a3b8] text-sm text-center">
              Your sports companion — Book, Compete, Perform
            </Text>
          </View>

          {/* ─── Phone Login Card ──────────────────────────────────────── */}
          <View className="bg-[#112B47] rounded-2xl p-6 border border-[#1e3a5f] mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}>
            <View className="flex-row items-center mb-3">
              <Smartphone size={18} color="#DA6F2B" />
              <Text className="text-white font-semibold ml-2">Mobile Number</Text>
            </View>

            {/* Phone Input */}
            <View className="flex-row items-center bg-[#0A1F35] rounded-xl border border-[#1e3a5f] px-4 py-3 mb-4">
              <Text className="text-[#94a3b8] font-semibold mr-2">+91</Text>
              <View className="w-px h-5 bg-[#1e3a5f] mr-3" />
              <View className="flex-1">
                {/* Using React Native TextInput directly (no expo dependency) */}
                <PhoneInput value={phoneNumber} onChange={setPhoneNumber} />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={loading}
              className="bg-[#DA6F2B] rounded-xl py-4 flex-row items-center justify-center"
              style={{ opacity: loading ? 0.7 : 1 }}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-bold text-base mr-2">Send OTP</Text>
                  <ArrowRight size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ─── Divider ──────────────────────────────────────────────── */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-px bg-[#1e3a5f]" />
            <Text className="text-[#94a3b8] mx-3 text-xs">OR</Text>
            <View className="flex-1 h-px bg-[#1e3a5f]" />
          </View>

          {/* ─── Google Sign-In ────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={googleLoading}
            className="bg-white rounded-xl py-4 flex-row items-center justify-center"
            style={{ opacity: googleLoading ? 0.7 : 1 }}
            activeOpacity={0.8}
          >
            {googleLoading ? (
              <ActivityIndicator color="#0A1F35" />
            ) : (
              <>
                <Text style={{ fontSize: 20, marginRight: 10 }}>🔵</Text>
                <Text className="text-[#0A1F35] font-bold text-base">Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* ─── Terms ────────────────────────────────────────────────── */}
          <Text className="text-[#64748b] text-xs text-center mt-6 leading-5">
            By continuing, you agree to our{' '}
            <Text className="text-[#DA6F2B]">Terms of Service</Text>
            {' '}and{' '}
            <Text className="text-[#DA6F2B]">Privacy Policy</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Inline Phone Input (no expo dep) ─────────────────────────────────────────
import { TextInput } from 'react-native';
function PhoneInput({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  return (
    <TextInput
      value={value}
      onChangeText={t => {
        const clean = t.replace(/\D/g, '').slice(0, 10);
        console.log('[DEV] PhoneInput onChangeText:', t, 'clean:', clean);
        onChange(clean);
      }}
      placeholder="9876543210"
      placeholderTextColor="#475569"
      keyboardType="phone-pad"
      maxLength={10}
      style={{ color: '#FFFFFF', fontSize: 16, flex: 1, paddingVertical: 0 }}
    />
  );
}
