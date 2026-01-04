import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import OTPVerifyScreen from './src/screens/OTPVerifyScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import PreRegisterVenueScreen from './src/screens/PreRegisterVenueScreen';
import PreRegisterSuccessScreen from './src/screens/PreRegisterSuccessScreen';
import AddVenueScreen from './src/screens/AddVenueScreen';
import VenueListScreen from './src/screens/VenueListScreen';
import VenueSuccessScreen from './src/screens/VenueSuccessScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="PreRegisterVenue" component={PreRegisterVenueScreen} />
          <Stack.Screen name="PreRegisterSuccess" component={PreRegisterSuccessScreen} />
          <Stack.Screen name="AddVenue" component={AddVenueScreen} />
          <Stack.Screen name="VenueList" component={VenueListScreen} />
          <Stack.Screen name="VenueSuccess" component={VenueSuccessScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

