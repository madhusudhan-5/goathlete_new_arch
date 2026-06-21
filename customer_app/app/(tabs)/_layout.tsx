import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Home, CalendarDays, Trophy, User } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#DA6F2B', // Brand Orange
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#112B47' : '#FFFFFF',
          borderTopColor: colorScheme === 'dark' ? '#1e3a5f' : '#e2e8f0',
          paddingBottom: 24,
          paddingTop: 8,
          height: 80,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <CalendarDays size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="compete"
        options={{
          title: 'Compete',
          tabBarIcon: ({ color }) => <Trophy size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
