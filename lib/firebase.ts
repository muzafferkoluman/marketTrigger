import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your actual Firebase project config values from the Firebase Console
// Create a .env file and add these variables (do not commit .env to version control)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBXXaO-Vxci3ujQ0FzdT33VzvZnjp84toA", // Temporary fallback from your plist
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "markettrigger-d3cb0.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "markettrigger-d3cb0",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "markettrigger-d3cb0.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "153275354633",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:153275354633:web:your-web-app-id",
};

// Initialize Firebase using the singleton pattern to support Fast Refresh in Expo
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = initializeAuth(app, {
  // @ts-ignore: getReactNativePersistence exists in JS but might be missing in older TS definitions
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
