import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import {getAnalytics, logEvent} from '@react-native-firebase/analytics';
import {getApp} from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const analytics = getAnalytics(getApp());
      const deviceId = await DeviceInfo.getUniqueId();
      const timestamp = Date.now();

      await logEvent(analytics, 'login_event', {email});

      await database()
        .ref(`/events/logins/${deviceId}`)
        .push({
          event: 'login_event',
          email,
          timestamp,
        });

      Alert.alert('Success', 'Login event logged and stored');
      navigation.navigate('Home');
    } catch (err) {
      console.error('❌ Error logging login:', err);
      Alert.alert('Error', 'Login failed to log or store.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Simulated Branding */}
      <Text style={styles.brand}>MyTelco</Text>

      {/* Login Card */}
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

        <TouchableOpacity onPress={() => Alert.alert('Forgot Password')}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => Alert.alert('Navigate to Sign Up')}>
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
    color: '#D81F25',
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
    backgroundColor: '#D81F25',
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
    color: '#D81F25',
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
    color: '#D81F25',
    fontWeight: '600',
  },
});
