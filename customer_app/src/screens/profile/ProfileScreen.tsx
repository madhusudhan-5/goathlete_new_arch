import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { Menu, Bell, ChevronRight, Pencil, Award, BarChart2, TrendingUp, LogOut, Settings, CircleHelp, CreditCard } from 'lucide-react-native';
import { playerService, authService } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { setIsLoggedIn } = useAuthContext();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [p, s] = await Promise.all([playerService.getProfileFresh(), playerService.getStats()]);
      setProfile(p); setStats(s);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleLogout = () => Alert.alert('Logout', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { 
      text: 'Logout', 
      style: 'destructive', 
      onPress: () => {
        setTimeout(async () => {
          await authService.logout();
          setIsLoggedIn(false);
        }, 150);
      } 
    },
  ]);

  if (loading) return <SafeAreaView className="flex-1 bg-[#0A1F35] items-center justify-center"><ActivityIndicator size="large" color="#DA6F2B" /></SafeAreaView>;

  const initials = profile?.first_name ? `${profile.first_name[0]}${profile.last_name?.[0] || ''}`.toUpperCase() : 'P';
  const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Athlete' : 'Athlete';

  const quickStats = [
    { label: 'Matches', value: stats?.matches_played || 0 },
    { label: 'Wins', value: stats?.matches_won || 0 },
    { label: 'Win %', value: `${stats?.win_rate || 0}%` },
    { label: 'Rank', value: stats?.city_rank || '—' },
  ];

  const menuItems = [
    { icon: <Pencil size={18} color="#DA6F2B" />, label: 'Edit Profile', screen: 'EditProfile' },
    { icon: <Award size={18} color="#DA6F2B" />, label: 'Badges & Achievements', screen: 'Badges' },
    { icon: <BarChart2 size={18} color="#DA6F2B" />, label: 'Sport Records', screen: 'SportRecord' },
    { icon: <TrendingUp size={18} color="#DA6F2B" />, label: 'Performance History', screen: 'Performance' },
    { icon: <Bell size={18} color="#94a3b8" />, label: 'Notifications', screen: 'Notifications' },
    { icon: <CreditCard size={18} color="#94a3b8" />, label: 'Payment Methods', screen: 'PaymentMethods' },
    { icon: <CircleHelp size={18} color="#94a3b8" />, label: 'Help & Support', screen: 'HelpSupport' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0A1F35]">
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DA6F2B" />} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}><Menu size={24} color="#FFFFFF" /></TouchableOpacity>
          <Text className="text-white font-bold text-lg">Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}><Bell size={22} color="#FFFFFF" /></TouchableOpacity>
        </View>

        {/* Avatar + Name */}
        <View className="items-center px-5 pb-6">
          <View className="w-24 h-24 rounded-full bg-[#DA6F2B] items-center justify-center mb-3"
            style={{ shadowColor: '#DA6F2B', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 }}>
            <Text className="text-white text-4xl font-bold">{initials}</Text>
          </View>
          <Text className="text-white text-2xl font-bold">{name}</Text>
          <Text className="text-[#94a3b8] text-sm mt-0.5">{profile?.phone}</Text>
          {profile?.city && <Text className="text-[#94a3b8] text-xs mt-0.5">📍 {profile.city}</Text>}
          {profile?.fitness_level && (
            <View className="bg-[#DA6F2B]/20 rounded-full px-3 py-1 mt-2">
              <Text className="text-[#DA6F2B] text-xs font-bold">{profile.fitness_level}</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View className="mx-5 bg-[#112B47] rounded-2xl border border-[#1e3a5f] p-4 mb-6 flex-row justify-between">
          {quickStats.map(s => (
            <View key={s.label} className="items-center">
              <Text className="text-white font-bold text-xl">{s.value}</Text>
              <Text className="text-[#94a3b8] text-[10px] mt-0.5">{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View className="mx-5 bg-[#112B47] rounded-2xl border border-[#1e3a5f] mb-5">
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => navigation.navigate(item.screen)}
              className={`flex-row items-center px-5 py-4 ${i < menuItems.length - 1 ? 'border-b border-[#1e3a5f]' : ''}`}
              activeOpacity={0.7}
            >
              <View className="w-8">{item.icon}</View>
              <Text className="text-white text-sm font-medium flex-1 ml-2">{item.label}</Text>
              <ChevronRight size={16} color="#475569" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View className="mx-5 mb-8">
          <TouchableOpacity onPress={handleLogout} className="bg-red-500/10 rounded-2xl border border-red-500/20 py-4 flex-row items-center justify-center" activeOpacity={0.85}>
            <LogOut size={18} color="#ef4444" />
            <Text className="text-red-400 font-bold text-sm ml-2">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
