import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { partnerService } from '../../services/api';
import { router } from 'expo-router';

export default function Dashboard() {
    const [stats, setStats] = useState({
        today_bookings: 0,
        my_bookings_today: 0,
        venue_name: ''
    });
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, profileData] = await Promise.all([
                partnerService.getDashboardStats(),
                partnerService.getProfile()
            ]);
            setStats(statsData);
            setProfile(profileData);
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="p-6">
                <Text className="text-3xl font-bold text-gray-900">Dashboard</Text>
                <Text className="text-gray-500 mt-1">Welcome back, {profile?.user?.first_name || 'Partner'}!</Text>
                <Text className="text-sm text-gray-400 mt-1">{stats.venue_name}</Text>

                {/* KPI Cards */}
                <View className="mt-6 space-y-4">
                    <View className="bg-white p-6 rounded-xl shadow-sm">
                        <Text className="text-sm font-medium text-gray-500">Today's Bookings</Text>
                        <Text className="text-3xl font-bold text-gray-900 mt-2">{stats.today_bookings}</Text>
                    </View>

                    <View className="bg-white p-6 rounded-xl shadow-sm">
                        <Text className="text-sm font-medium text-gray-500">My Bookings</Text>
                        <Text className="text-3xl font-bold text-gray-900 mt-2">{stats.my_bookings_today}</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="mt-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Quick Actions</Text>

                    <TouchableOpacity
                        onPress={() => router.push('/bookings/create')}
                        className="bg-primary p-4 rounded-lg mb-3"
                    >
                        <Text className="text-white font-medium text-center">Create Booking</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/bookings/block')}
                        className="bg-red-600 p-4 rounded-lg"
                    >
                        <Text className="text-white font-medium text-center">Block Slot</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
