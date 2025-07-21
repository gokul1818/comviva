import AsyncStorage from '@react-native-community/async-storage';
import {getApp} from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  requestPermission,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

import {Platform} from 'react-native';
import {check, request, RESULTS} from 'react-native-permissions';

export async function requestUserPermission(): Promise<void> {
  const messaging = getMessaging(getApp());

  // 🔐 Request notification permission on Android 13+
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

  // 🔐 Firebase-level permission (for iOS / safe fallback for Android)
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
}

export async function getFcmToken(): Promise<void> {
  const messaging = getMessaging(getApp());

  try {
    const existingToken = await AsyncStorage.getItem('fcmToken');
    console.log(existingToken, 'OLD TOKEN');

    if (!existingToken) {
      // ✅ Register device before getting token (required on Android)
      const isRegistered = await isDeviceRegisteredForRemoteMessages(messaging);
      if (!isRegistered) {
        await registerDeviceForRemoteMessages(messaging);
      }

      const token = await getToken(messaging);
      if (token) {
        console.log(token, 'NEW TOKEN');
        await AsyncStorage.setItem('fcmToken', token);
      } else {
        console.warn('⚠️ Token not returned from Firebase.');
      }
    }
  } catch (error) {
    console.error('🔥 Error fetching FCM token:', error);
  }
}
