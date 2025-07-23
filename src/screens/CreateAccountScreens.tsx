import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {getAnalytics, logEvent} from '@react-native-firebase/analytics';
import {getApp} from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-community/async-storage';
import {useFocusEffect} from '@react-navigation/native';

const CreateAccountScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignup = async () => {
    try {
      const analytics = getAnalytics(getApp());
      const deviceId = await DeviceInfo.getUniqueId();
      const timestamp = Date.now();
      const fcmToken = await AsyncStorage.getItem('fcmToken');

      // Replace '.' and '@' to make email safe for Firebase key
      const formatEmailKey = (email: string) =>
        email.replace(/\./g, '_').replace(/@/g, '_');
      const emailKey = formatEmailKey(email).toLowerCase();

      const userRef = database().ref(`users/${emailKey}`);
      const snapshot = await userRef.once('value');

      const customEvent = {
        id: deviceId,
        deviceId: deviceId || 'unknown_device',
        email: email.toLowerCase() || 'no_email',
        name: name || 'no_name',
        event: 'signups',
        fcmToken: fcmToken || '',
        timestamp,
      };

      if (snapshot.exists()) {
        Alert.alert(
          'User Exists',
          'An account with this email already exists.',
        );
        return;
      }

      // Save new user data
      await userRef.set(customEvent);
      console.log('✅ New signup event created.');

      Alert.alert('Success', 'Account created successfully.');
      navigation.navigate('Login');
    } catch (err) {
      console.error('❌ Error logging signup:', err);
      Alert.alert('Error', 'Account creation failed.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const logSignupScreenEvent = async () => {
        try {
          const deviceId = await DeviceInfo.getUniqueId();
          const analytics = getAnalytics(getApp());
          const timestamp = Date.now();
          const screenRef = database().ref(`/screens/signupScreen/${deviceId}`);

          const snapshot = await screenRef.once('value');

          if (!snapshot.exists()) {
            await logEvent(analytics, 'signup_screen');
            await screenRef.set({timestamp});
            console.log('✅ Signup screen event logged');
          } else {
            await screenRef.update({timestamp});
            console.log(
              'ℹ️ Signup screen event already exists for this device.',
            );
          }
        } catch (err) {
          console.error('❌ Error logging signup screen event:', err);
        }
      };

      logSignupScreenEvent();
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>MyTelco</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Create your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />

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
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
          <Text style={styles.loginText}>SIGN UP</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.signup}>
          Already have an account? <Text style={styles.linkBold}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateAccountScreen;

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
