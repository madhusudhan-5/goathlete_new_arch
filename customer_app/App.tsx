/**
 * GoAthlete — Root Navigation
 *
 * Structure:
 *   AuthStack   (no token)  → Login → OTP
 *   AppDrawer   (has token) → Drawer wrapping BottomTabNavigator
 *     Tabs: Home | Bookings | Compete | Profile
 *       Home stack     → VenueDetail → CourtSelect → SlotSelect → Confirm → Success
 *       Compete stack  → TournamentDetail | CreateTournament | Scoreboard | OpenMatches
 *       Profile stack  → EditProfile | Badges | SportRecord | Performance
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Note: GestureHandlerRootView is wrapped below — patched for React 18 compatibility
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, CalendarDays, Trophy, User } from 'lucide-react-native';
import BootSplash from 'react-native-bootsplash';

// ─── Screens ─────────────────────────────────────────────────────────────────
// Auth
import LoginScreen from './src/screens/auth/LoginScreen';
import OTPScreen from './src/screens/auth/OTPScreen';

// Main Tabs
import HomeScreen from './src/screens/home/HomeScreen';
import BookingsScreen from './src/screens/bookings/BookingsScreen';
import CompeteScreen from './src/screens/compete/CompeteScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';

// Home Stack
import VenueDetailScreen from './src/screens/venues/VenueDetailScreen';
import CourtSelectScreen from './src/screens/booking/CourtSelectScreen';
import SlotSelectScreen from './src/screens/booking/SlotSelectScreen';
import BookingConfirmScreen from './src/screens/booking/BookingConfirmScreen';
import BookingSuccessScreen from './src/screens/booking/BookingSuccessScreen';
// import BookingDetailScreen from './src/screens/bookings/BookingDetailScreen';
import VenueBrowseScreen from './src/screens/venues/VenueBrowseScreen';
import OpenMatchesScreen from './src/screens/matches/OpenMatchesScreen';
import CreateOpenMatchScreen from './src/screens/matches/CreateOpenMatchScreen';

// Compete Stack
import TournamentDetailScreen from './src/screens/compete/TournamentDetailScreen';
import CreateTournamentScreen from './src/screens/compete/CreateTournamentScreen';
import ScoreboardScreen from './src/screens/compete/ScoreboardScreen';
import MatchDetailScreen from './src/screens/compete/MatchDetailScreen';
import UmpirePanel from './src/screens/compete/UmpirePanel';
import MatchAwardsScreen from './src/screens/compete/MatchAwardsScreen';

// Profile Stack
import EditProfileScreen from './src/screens/profile/EditProfileScreen';
import BadgesScreen from './src/screens/profile/BadgesScreen';
import SportRecordScreen from './src/screens/profile/SportRecordScreen';
import PerformanceScreen from './src/screens/profile/PerformanceScreen';

// Settings / Modals
import NotificationsScreen from './src/screens/settings/NotificationsScreen';
import PaymentMethodsScreen from './src/screens/settings/PaymentMethodsScreen';
import HelpSupportScreen from './src/screens/settings/HelpSupportScreen';
import LeaderboardScreen from './src/screens/settings/LeaderboardScreen';

// Drawer
import DrawerContent from './src/components/navigation/DrawerContent';

// Context
import { AuthContext } from './src/context/AuthContext';



// ─── Navigators ───────────────────────────────────────────────────────────────
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const CompeteStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const RootStack = createNativeStackNavigator();

// ─── Auth Navigator ───────────────────────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="OTP" component={OTPScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Home Stack ───────────────────────────────────────────────────────────────
function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="VenueBrowse" component={VenueBrowseScreen} />
      <HomeStack.Screen name="VenueDetail" component={VenueDetailScreen} />
      <HomeStack.Screen name="CourtSelect" component={CourtSelectScreen} />
      <HomeStack.Screen name="SlotSelect" component={SlotSelectScreen} />
      <HomeStack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
      <HomeStack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
      <HomeStack.Screen name="OpenMatches" component={OpenMatchesScreen} />
      <HomeStack.Screen name="CreateOpenMatch" component={CreateOpenMatchScreen} />
    </HomeStack.Navigator>
  );
}

// ─── Bookings Stack ────────────────────────────────────────────────────────────
function BookingsNavigator() {
  return (
    <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingsStack.Screen name="BookingsList" component={BookingsScreen} />
      {/* <BookingsStack.Screen name="BookingDetail" component={BookingDetailScreen} /> */}
    </BookingsStack.Navigator>
  );
}

// ─── Compete Stack ─────────────────────────────────────────────────────────────
function CompeteNavigator() {
  return (
    <CompeteStack.Navigator screenOptions={{ headerShown: false }}>
      <CompeteStack.Screen name="CompeteMain" component={CompeteScreen} />
      <CompeteStack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
      <CompeteStack.Screen name="CreateTournament" component={CreateTournamentScreen} />
      <CompeteStack.Screen name="Scoreboard" component={ScoreboardScreen} />
      <CompeteStack.Screen name="MatchDetail" component={MatchDetailScreen} />
      <CompeteStack.Screen name="UmpirePanel" component={UmpirePanel} />
      <CompeteStack.Screen name="MatchAwards" component={MatchAwardsScreen} />
    </CompeteStack.Navigator>
  );
}

// ─── Profile Stack ─────────────────────────────────────────────────────────────
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Badges" component={BadgesScreen} />
      <ProfileStack.Screen name="SportRecord" component={SportRecordScreen} />
      <ProfileStack.Screen name="Performance" component={PerformanceScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
      <ProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <ProfileStack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <ProfileStack.Screen name="Leaderboard" component={LeaderboardScreen} />
    </ProfileStack.Navigator>
  );
}

// ─── Tab Navigator ─────────────────────────────────────────────────────────────
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#DA6F2B',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#112B47',
          borderTopColor: '#1e3a5f',
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 84 : 68,
        },
        tabBarLabelStyle: {
          fontFamily: 'Manrope-SemiBold',
          fontSize: 11,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsNavigator}
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="CompeteTab"
        component={CompeteNavigator}
        options={{
          title: 'Compete',
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Drawer Navigator ──────────────────────────────────────────────────────────
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {
          backgroundColor: '#0A1F35',
          width: 280,
        },
        overlayColor: 'rgba(0,0,0,0.6)',
        swipeEdgeWidth: 60,
      }}
    >
      <Drawer.Screen name="Main" component={TabNavigator} />
    </Drawer.Navigator>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1F35' }}>
        <ActivityIndicator size="large" color="#DA6F2B" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        <NavigationContainer onReady={() => BootSplash.hide({ fade: true })}>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
              <RootStack.Screen name="App" component={DrawerNavigator} />
            ) : (
              <RootStack.Screen name="Auth" component={AuthNavigator} />
            )}
          </RootStack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </GestureHandlerRootView>
  );
}
