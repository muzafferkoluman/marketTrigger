import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotification(pushToken: string, title: string, body: string, data?: any) {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`[Notifications] Push token ${pushToken} is not a valid Expo push token`);
    return false;
  }

  const message: ExpoPushMessage = {
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
  };

  try {
    const receipts = await expo.sendPushNotificationsAsync([message]);
    console.log(`[Notifications] Sent notification payload. Receipt:`, receipts);
    return true;
  } catch (error) {
    console.error(`[Notifications] Error sending notification:`, error);
    return false;
  }
}
