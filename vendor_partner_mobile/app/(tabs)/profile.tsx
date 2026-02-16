import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { authService, partnerService } from '../../services/api';

export default function Profile() {
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await partnerService.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Failed to load profile', error);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await authService.logout();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="p-6">
                <Text className="text-3xl font-bold text-gray-900 mb-6">Profile</Text>

                <View className="bg-white p-6 rounded-xl shadow-sm mb-4">
                    <Text className="text-sm text-gray-500">Name</Text>
                    <Text className="text-lg font-bold text-gray-900 mt-1">
                        {profile?.user?.first_name} {profile?.user?.last_name}
                    </Text>
                </View>

                <View className="bg-white p-6 rounded-xl shadow-sm mb-4">
                    <Text className="text-sm text-gray-500">Email</Text>
                    <Text className="text-lg font-bold text-gray-900 mt-1">{profile?.user?.email}</Text>
                </View>

                <View className="bg-white p-6 rounded-xl shadow-sm mb-4">
                    <Text className="text-sm text-gray-500">Venue</Text>
                    <Text className="text-lg font-bold text-gray-900 mt-1">{profile?.venue?.name}</Text>
                </View>

                <View className="bg-white p-6 rounded-xl shadow-sm mb-4">
                    <Text className="text-sm text-gray-500">Phone</Text>
                    <Text className="text-lg font-bold text-gray-900 mt-1">{profile?.phone || 'Not set'}</Text>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-600 p-4 rounded-lg mt-6"
                >
                    <Text className="text-white font-bold text-center">Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
