import { Platform } from 'react-native';

// ─── Environment Detection ─────────────────────────────────────────────────
// __DEV__ = true in debug builds, false in release builds
// Use this to switch between local and production

const IS_DEV = __DEV__;

// ─── API URLs ──────────────────────────────────────────────────────────────
// DEV  (Android Emulator) : http://10.0.2.2:8000/api
// DEV  (iOS Simulator)    : http://localhost:8000/api
// DEV  (Physical Device)  : http://<your-local-ip>:8000/api
// PROD (Live Server)      : https://api.goathlete.in/api

const DEV_API_URL =
  Platform.OS === 'android'
    ? 'http://192.168.1.4:8000/api'
    : 'http://localhost:8000/api';

const PROD_API_URL = 'https://api.goathlete.in/api';

export const API_BASE_URL = 'http://192.168.1.4:8000/api';

// ─── Google OAuth ──────────────────────────────────────────────────────────
// DEV  : Console log only — no real Google sign-in configured
// PROD : Replace with your actual Google OAuth Client IDs from Google Cloud Console
export const GOOGLE_CONFIG = {
  webClientId: IS_DEV
    ? 'DEV_PLACEHOLDER_WEB_CLIENT_ID'
    : 'YOUR_PROD_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: IS_DEV
    ? 'DEV_PLACEHOLDER_IOS_CLIENT_ID'
    : 'YOUR_PROD_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: IS_DEV
    ? 'DEV_PLACEHOLDER_ANDROID_CLIENT_ID'
    : 'YOUR_PROD_ANDROID_CLIENT_ID.apps.googleusercontent.com',
};

// ─── Razorpay ──────────────────────────────────────────────────────────────
// DEV  : Test key (rzp_test_*) — payments go to Razorpay sandbox, no real money
// PROD : Live key (rzp_live_*) — real payments
export const RAZORPAY_CONFIG = {
  keyId: IS_DEV
    ? 'rzp_test_YOUR_TEST_KEY_HERE'   // Replace with actual Razorpay test key
    : 'rzp_live_YOUR_LIVE_KEY_HERE',  // Replace with actual Razorpay live key
  currency: 'INR',
  appName: 'GoAthlete',
};

// ─── App Info ──────────────────────────────────────────────────────────────
export const APP_CONFIG = {
  appName: 'GoAthlete',
  supportEmail: 'support@goathlete.in',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=com.goathlete.player',
  appStoreUrl: 'https://apps.apple.com/app/goathlete/id000000000',
  // Scoreboard polling interval for LIVE matches (milliseconds)
  liveScoreRefreshInterval: 10000,
  // How many nearby venues to show
  nearbyVenuesRadius: 10, // km
  nearbyVenuesLimit: 10,
};

// ─── Dev Helpers ───────────────────────────────────────────────────────────
// In DEV, log all API calls and responses to console
export const LOG_API_CALLS = IS_DEV;
