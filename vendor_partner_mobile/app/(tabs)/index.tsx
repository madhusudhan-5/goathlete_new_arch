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
            <View className="flex-1 justify-center items-center bg-[#F8F9FA]">
                <ActivityIndicator size="large" color="#DA6F2B" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-[#F8F9FA]">
            <View className="p-6">
                <Text className="text-3xl font-extrabold text-[#0A1F35]">Dashboard</Text>
                <Text className="text-gray-500 mt-1 font-medium">Welcome back, {profile?.user?.first_name || 'Partner'}!</Text>
                <Text className="text-xs font-bold text-[#DA6F2B] mt-1 tracking-wider uppercase">{stats.venue_name}</Text>

                {/* KPI Cards */}
                <View className="mt-6 flex-row justify-between space-x-4">
                    <View className="bg-white p-6 rounded-2xl shadow-sm flex-1 border border-gray-100 border-b-4 border-b-[#DA6F2B]">
                        <Text className="text-xs font-bold text-gray-500 uppercase tracking-wide">Today's Bookings</Text>
                        <Text className="text-4xl font-extrabold text-[#0A1F35] mt-2">{stats.today_bookings}</Text>
                    </View>

                    <View className="bg-white p-6 rounded-2xl shadow-sm flex-1 border border-gray-100 border-b-4 border-b-[#0A1F35]">
                        <Text className="text-xs font-bold text-gray-500 uppercase tracking-wide">My Bookings</Text>
                        <Text className="text-4xl font-extrabold text-[#0A1F35] mt-2">{stats.my_bookings_today}</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="mt-8">
                    <Text className="text-xl font-bold text-[#0A1F35] mb-4">Quick Actions</Text>

                    <TouchableOpacity
                        onPress={() => router.push('/bookings/create')}
                        className="bg-[#DA6F2B] p-4 rounded-xl mb-3 shadow-md shadow-[#DA6F2B]/20"
                    >
                        <Text className="text-white font-bold text-center text-lg">Create Booking</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/bookings/block')}
                        className="bg-red-500 p-4 rounded-xl shadow-md shadow-red-500/20"
                    >
                        <Text className="text-white font-bold text-center text-lg">Block Slot</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
