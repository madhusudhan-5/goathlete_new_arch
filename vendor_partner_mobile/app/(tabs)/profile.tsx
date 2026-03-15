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
        <ScrollView className="flex-1 bg-[#F8F9FA]">
            <View className="p-6">
                <Text className="text-3xl font-extrabold text-[#0A1F35] mb-6">Profile</Text>

                <View className="bg-white p-6 rounded-2xl shadow-sm mb-4 border-0">
                    <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">Name</Text>
                    <Text className="text-lg font-extrabold text-[#0A1F35] mt-1">
                        {profile?.user?.first_name} {profile?.user?.last_name}
                    </Text>
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-sm mb-4 border-0">
                    <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</Text>
                    <Text className="text-lg font-extrabold text-[#0A1F35] mt-1">{profile?.user?.email}</Text>
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-sm mb-4 border-0">
                    <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">Venue</Text>
                    <Text className="text-lg font-extrabold text-[#0A1F35] mt-1">{profile?.venue?.name}</Text>
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-sm mb-4 border-0">
                    <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone</Text>
                    <Text className="text-lg font-extrabold text-[#0A1F35] mt-1">{profile?.phone || 'Not set'}</Text>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-50 p-4 rounded-xl mt-6 border border-red-200"
                >
                    <Text className="text-red-600 font-bold text-center text-lg">Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
