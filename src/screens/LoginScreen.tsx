import AsyncStorage from '@react-native-community/async-storage';
import database, {getDatabase, ref} from '@react-native-firebase/database';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {generateUUID} from '../helpers';
import {getApp} from '@react-native-firebase/app';
import Logo from '../assets/comvivaLogo.png';
import { SafeAreaProvider } from 'react-native-safe-area-context';
const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        return;
      }

      const deviceId = await DeviceInfo.getUniqueId();
      const timestamp = Date.now();
      const fcmToken = await AsyncStorage.getItem('fcmToken');

      // ✅ Format email to use as Firebase key
      const formatEmailKey = (email: string) =>
        email.replace(/\./g, '_').replace(/@/g, '_');
      const emailKey = formatEmailKey(email)?.toLowerCase();
      console.log('emailKey: ', emailKey);

      // 🔍 Check if the user exists in the database
      const userRef = database().ref(`users/${emailKey}`);
      const userSnapshot = await userRef.once('value');

      if (!userSnapshot.exists()) {
        Alert.alert('Login Failed', 'Email not found. Please sign up first.');
        return;
      }

      // 🆕 Create unique login entry using timestamp + unique ID
      const uniqueId = generateUUID();
      const loginEntryKey = `${timestamp}_${uniqueId}`; // Creates unique key each time

      // Reference to new login entry (not overwriting existing ones)
      const newLoginRef = database().ref(`events/${uniqueId}`);

      const createdAt = new Date().toISOString();
      const userData = userSnapshot.val();
      const userId = userData?.user_id || generateUUID();

      // Login event data
      const customEvent = {
        unique_id: uniqueId,
        user_id: userId,
        device_token: deviceId,
        email: email,
        event: 'logins',
        screen_name: 'logins',
        fcm_token: fcmToken || '',
        email_id: email.replace('@', '_').replace('.', '_'),
        timestamp: timestamp.toString(),
        count: 0,
        notification_status: 'pending',
        createdAt: createdAt,
        updatedAt: createdAt,
      };

      // Update user's FCM token
      await userRef.update({fcmToken: fcmToken || ''});

      // ✅ Always create NEW login entry
      await newLoginRef.set(customEvent);
      console.log('✅ New login event created with key:', loginEntryKey);

      await AsyncStorage.setItem('emailKey', emailKey);
      navigation.navigate('Home');
    } catch (err) {
      console.error('❌ Error logging login:', err);
      Alert.alert('Error', 'Login failed due to an error.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const logLoginScreenEvent = async () => {
        try {
          const timestamp = Date.now();
          const screenRef = database().ref(`/screens/logins`);
          const eventlistRef = database().ref(`/eventList/logins`);
          await eventlistRef.set({timestamp, eventName: 'logins'});
          await screenRef.set({timestamp});
          const emailKey = await AsyncStorage.getItem('emailKey');
          const loginRef = database().ref(`events/logins/${emailKey}`);
          const loginSnapshot = await loginRef.once('value');
          if (loginSnapshot.exists()) {
            const userRef = database().ref(`users/${emailKey}`);
            await userRef.update({fcmToken: ''});
            await loginRef.update({fcmToken: ''});
            console.log('🔄 Existing login event updated.');
          }
        } catch (err) {
          console.error('❌ Error logging login screen event:', err);
        }
      };

      logLoginScreenEvent();
    }, []),
  );

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.logoContainer}>
        <Image style={styles.logoImg} source={Logo} alt="logo" />
        <Text style={styles.brand}>Comviva</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Login to your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          keyboardType="visible-password"
          placeholderTextColor="#999"
          secureTextEntry={true}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
        <Text style={styles.signup}>
          New to comviva? <Text style={styles.linkBold}>Create an account</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaProvider>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap:5,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoImg: {
    width: '10%',
    height: '100%',
  },
  brand: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e87e40',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  loginButton: {
    backgroundColor: '#e87e40',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    color: '#e87e40',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  signup: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 30,
    color: '#666',
  },
  linkBold: {
    color: '#e87e40',
    fontWeight: '600',
  },
});
