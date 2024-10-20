import * as Notifications from 'expo-notifications';
import { isAndroid, isIOS } from './helpers/device';

export async function registerForPushNotificationsAsync(): Promise<void> {
  if (isAndroid() || isIOS()) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return; // Failed to get push token for push notification!
    }

    try {
      const { data: token } = await Notifications.getExpoPushTokenAsync();

      // TODO: Persist this
      console.log('got token :: ', token);
    } catch (e) {
      console.log('error :: ', e);
    }
  } else {
    return; // Must use physical device for Push Notifications
  }

  if (isAndroid()) {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

