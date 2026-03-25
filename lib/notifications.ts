import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync(uid: string) {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return;
  }
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return;
  }
  
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    
    // For MVP, if not using EAS, this works out of the box with standard Expo Go config
    const token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      })
    ).data;
    
    console.log("Expo Push Token:", token);
    
    // Save to Firestore
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, { pushToken: token }, { merge: true });
    
  } catch (e: any) {
    console.log("Error getting push token:", e);
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}
