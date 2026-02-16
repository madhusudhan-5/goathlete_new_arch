import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { authService } from '../../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        setLoading(true);
        try {
            await authService.login(email, password);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert('Login Failed', error.response?.data?.detail || 'Please check your credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 justify-center px-6">
            <View className="bg-white rounded-2xl p-8 shadow-xl">
                <Text className="text-3xl font-bold text-gray-900 text-center mb-2">GoAthlete Partner</Text>
                <Text className="text-gray-500 text-center mb-8">Sign in to manage your venue</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                            placeholder="partner@venue.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                            placeholder="••••••••"
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        className="w-full bg-primary py-3 rounded-lg mt-4"
                    >
                        <Text className="text-white text-center font-medium">
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
