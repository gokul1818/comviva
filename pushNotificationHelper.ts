import AsyncStorage from '@react-native-community/async-storage';
import {Platform} from 'react-native';
import {check, request, RESULTS} from 'react-native-permissions';
import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  requestPermission,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

export async function requestUserPermission(): Promise<void> {
  const messaging = getMessaging(getApp());

  try {
    // 🔐 Ask for Android 13+ POST_NOTIFICATIONS permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const ANDROID_POST_NOTIFICATIONS = 'android.permission.POST_NOTIFICATIONS';

      const permission = await check(ANDROID_POST_NOTIFICATIONS as any);

      if (permission !== RESULTS.GRANTED) {
        const requestResult = await request(ANDROID_POST_NOTIFICATIONS as any);

        if (requestResult !== RESULTS.GRANTED) {
          console.warn('🔕 Notification permission denied by user.');
          return;
        }
      }
    }

    // 🔐 Firebase-level permission (also covers iOS)
    const authStatus = await requestPermission(messaging);
    const enabled =
      authStatus === AuthorizationStatus.AUTHORIZED ||
      authStatus === AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Firebase Messaging authorized:', authStatus);
      await getFcmToken();
    } else {
      console.warn('❌ Firebase Messaging permission denied.');
    }
  } catch (error) {
    console.error('🔥 Error during permission request:', error);
  }
}

export async function getFcmToken(): Promise<void> {
  const messaging = getMessaging(getApp());

  try {
    const existingToken = await AsyncStorage.getItem('fcmToken');
    console.log('🔁 Existing FCM Token:', existingToken);

    if (!existingToken) {
      const isRegistered = await isDeviceRegisteredForRemoteMessages(messaging);
      if (!isRegistered) {
        await registerDeviceForRemoteMessages(messaging);
      }

      const token = await getToken(messaging);
      if (token) {
        console.log('📨 New FCM Token:', token);
        await AsyncStorage.setItem('fcmToken', token);
      } else {
        console.warn('⚠️ No FCM token received.');
      }
    }
  } catch (error) {
    console.error('🔥 Error getting FCM token:', error);
  }
}
