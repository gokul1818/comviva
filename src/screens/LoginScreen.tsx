import AsyncStorage from '@react-native-community/async-storage';
import database from '@react-native-firebase/database';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        return;
      }
      // const analytics = getAnalytics(getApp());
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

      const loginRef = database().ref(`events/logins/${emailKey}`);
      const loginSnapshot = await loginRef.once('value');

      const customEvent = {
        id: emailKey,
        deviceId,
        email,
        event: 'logins',
        fcmToken: fcmToken || '',
        timestamp,
      };

      await userRef.update({fcmToken: fcmToken || ''});
      if (loginSnapshot.exists()) {
        await loginRef.update(customEvent);
        console.log('🔄 Existing login event updated.');
      } else {
        await loginRef.set(customEvent);
        console.log('✅ New login event created.');
      }
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
          const deviceId = await DeviceInfo.getUniqueId();
          // const analytics = getAnalytics(getApp());
          const timestamp = Date.now();
          const screenRef = database().ref(`/screens/loginScreen/${deviceId}`);
          const emailKey = await AsyncStorage.getItem('emailKey');

          const loginRef = database().ref(`events/logins/${emailKey}`);
          const loginSnapshot = await loginRef.once('value');

          const snapshot = await screenRef.once('value');
          if (loginSnapshot.exists()) {
            const userRef = database().ref(`users/${emailKey}`);
            await userRef.update({fcmToken: ''});

            await loginRef.update({fcmToken: ''});
            console.log('🔄 Existing login event updated.');
          }
          if (!snapshot.exists()) {
            // await logEvent(analytics, 'logins');
            await screenRef.set({timestamp});
            console.log('✅ Login screen event logged');
          } else {
            await screenRef.update({timestamp});
            console.log(
              'ℹ️ Login screen event already exists for this device.',
            );
          }
        } catch (err) {
          console.error('❌ Error logging login screen event:', err);
        }
      };

      logLoginScreenEvent();
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>MyTelco</Text>

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
          secureTextEntry
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
          New to MyTelco? <Text style={styles.linkBold}>Create an account</Text>
        </Text>
      </TouchableOpacity>
    </View>
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
  brand: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e87e40',
    textAlign: 'center',
    marginBottom: 30,
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
