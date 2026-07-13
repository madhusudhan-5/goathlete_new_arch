import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  Image, Alert,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import {
  Home, CalendarDays, Trophy, User, MapPin, ShoppingBag,
  Award, Settings, CircleHelp, LogOut, ChevronRight,
  Activity, Zap,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  badge?: string;
}

export default function DrawerContent(props: any) {
  const { navigation } = props;
  const { setIsLoggedIn } = useAuthContext();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data = await AsyncStorage.getItem('user_data');
      if (data) setUser(JSON.parse(data));
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          navigation.closeDrawer();
          setTimeout(async () => {
            await authService.logout();
            setIsLoggedIn(false);
          }, 150);
        },
      },
    ]);
  };

  const navigateToTab = (tabName: string) => {
    navigation.closeDrawer();
    navigation.navigate('Main', { screen: tabName });
  };

  const navigateToScreen = (stackTab: string, screenName: string, params?: object) => {
    navigation.closeDrawer();
    navigation.navigate('Main', {
      screen: stackTab,
      params: { screen: screenName, params },
    });
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Main',
      items: [
        {
          icon: <Home size={20} color="#DA6F2B" />,
          label: 'Home',
          onPress: () => navigateToTab('HomeTab'),
        },
        {
          icon: <CalendarDays size={20} color="#DA6F2B" />,
          label: 'Venue Bookings',
          onPress: () => navigateToTab('BookingsTab'),
        },
        {
          icon: <Zap size={20} color="#DA6F2B" />,
          label: 'Live Matches',
          onPress: () => navigateToScreen('HomeTab', 'OpenMatches'),
        },
        {
          icon: <Trophy size={20} color="#DA6F2B" />,
          label: 'Tournaments',
          onPress: () => navigateToTab('CompeteTab'),
        },
      ],
    },
    {
      title: 'My Performance',
      items: [
        {
          icon: <Activity size={20} color="#94a3b8" />,
          label: 'Performance Dashboard',
          onPress: () => navigateToScreen('ProfileTab', 'Performance'),
        },
        {
          icon: <Award size={20} color="#94a3b8" />,
          label: 'Badges & Achievements',
          onPress: () => navigateToScreen('ProfileTab', 'Badges'),
        },
        {
          icon: <User size={20} color="#94a3b8" />,
          label: 'Sport Records',
          onPress: () => navigateToScreen('ProfileTab', 'SportRecord'),
        },
      ],
    },
    {
      title: 'More',
      items: [
        {
          icon: <ShoppingBag size={20} color="#94a3b8" />,
          label: 'Equipment Rentals',
          onPress: () => navigateToScreen('HomeTab', 'VenueBrowse'),
        },
        {
          icon: <MapPin size={20} color="#94a3b8" />,
          label: 'Leaderboard',
          onPress: () => navigateToScreen('ProfileTab', 'Leaderboard'),
        },
        {
          icon: <CircleHelp size={20} color="#94a3b8" />,
          label: 'Help & Support',
          onPress: () => navigateToScreen('ProfileTab', 'HelpSupport'),
        },
        {
          icon: <Settings size={20} color="#94a3b8" />,
          label: 'Settings',
          onPress: () => navigateToTab('ProfileTab'),
        },
      ],
    },
  ];

  const initials = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
    : 'P';

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1, paddingTop: 0 }}
      style={{ backgroundColor: '#0A1F35' }}
    >
      {/* ─── User Header ───────────────────────────────────────────────── */}
      <View
        className="px-5 pt-12 pb-6 border-b border-[#1e3a5f]"
        style={{ backgroundColor: '#112B47' }}
      >
        {/* Avatar */}
        <TouchableOpacity
          onPress={() => navigateToTab('ProfileTab')}
          className="w-16 h-16 rounded-full bg-[#DA6F2B] items-center justify-center mb-3"
          style={{ shadowColor: '#DA6F2B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }}
        >
          <Text className="text-white text-2xl font-bold">{initials}</Text>
        </TouchableOpacity>

        <Text className="text-white text-lg font-bold">
          {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'GoAthlete Player'}
        </Text>
        <Text className="text-[#94a3b8] text-xs mt-0.5">{user?.phone || ''}</Text>

        {/* Edit Profile button */}
        <TouchableOpacity
          onPress={() => navigateToScreen('ProfileTab', 'EditProfile')}
          className="mt-3 flex-row items-center"
        >
          <Text className="text-[#DA6F2B] text-xs font-semibold">Edit Profile</Text>
          <ChevronRight size={12} color="#DA6F2B" />
        </TouchableOpacity>
      </View>

      {/* ─── Menu Sections ─────────────────────────────────────────────── */}
      <ScrollView className="flex-1 py-4" showsVerticalScrollIndicator={false}>
        {menuSections.map(section => (
          <View key={section.title} className="mb-4">
            <Text className="text-[#475569] text-[10px] font-bold tracking-widest uppercase px-5 mb-2">
              {section.title}
            </Text>
            {section.items.map(item => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                className="flex-row items-center px-5 py-3.5"
                activeOpacity={0.7}
              >
                <View className="w-8 items-center">{item.icon}</View>
                <Text className="text-[#e2e8f0] text-sm font-medium ml-3 flex-1">{item.label}</Text>
                {item.badge && (
                  <View className="bg-[#DA6F2B] rounded-full px-2 py-0.5">
                    <Text className="text-white text-[10px] font-bold">{item.badge}</Text>
                  </View>
                )}
                <ChevronRight size={14} color="#475569" />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* ─── Logout ────────────────────────────────────────────────────── */}
      <View className="px-5 pb-8 pt-2 border-t border-[#1e3a5f]">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center py-3.5"
          activeOpacity={0.7}
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-400 text-sm font-semibold ml-3">Logout</Text>
        </TouchableOpacity>
        <Text className="text-[#334155] text-[10px] mt-1">GoAthlete v1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}
