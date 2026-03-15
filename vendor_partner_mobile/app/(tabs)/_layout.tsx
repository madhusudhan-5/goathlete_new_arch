import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

// Simple icon components (you can replace with react-native-vector-icons later)
const Icon = ({ name, color }: { name: string; color: string }) => (
    <View className="w-6 h-6 rounded-full justify-center items-center" style={{ backgroundColor: color }}>
        <Text className="text-white text-xs font-bold">{name[0]}</Text>
    </View>
);

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#DA6F2B', // brand-orange
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <Icon name="Dashboard" color={color} />,
                }}
            />
            <Tabs.Screen
                name="courts"
                options={{
                    title: 'Courts',
                    tabBarIcon: ({ color }) => <Icon name="Courts" color={color} />,
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'Bookings',
                    tabBarIcon: ({ color }) => <Icon name="Bookings" color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Icon name="Profile" color={color} />,
                }}
            />
        </Tabs>
    );
}
