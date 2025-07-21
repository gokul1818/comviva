import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import {getAnalytics, logEvent} from '@react-native-firebase/analytics';
import {getApp} from '@react-native-firebase/app';
import {requestUserPermission} from './pushNotificationHelper';
import AsyncStorage from '@react-native-community/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';

const App = () => {
  const [deviceToken, setDeviceToken] = useState<any>('');
  useEffect(() => {
    requestUserPermission();
    setTimeout(async () => {
      const existingToken = await AsyncStorage.getItem('fcmToken');
      setDeviceToken(existingToken);
    }, 3000);
  }, []);
  const triggerEvent = async () => {
    try {
      const app = getApp(); // Get the default app
      const analytics = getAnalytics(app); // Get analytics instance
      await logEvent(analytics, 'comviva_event', {
        screen: 'TriggerEventScreen',
        purpose: 'Testing Firebase Analytics',
      });
      Alert.alert('Success', 'Comviva Event sent to Firebase Analytics!');
    } catch (error) {
      console.error('❌ Failed to log event:', error);
    }
  };

  const triggerHomeEvent = async () => {
    try {
      const app = getApp(); // Get the default app
      const analytics = getAnalytics(app); // Get analytics instance
      await logEvent(analytics, 'comviva_home_event', {
        screen: 'TriggerHomeEventScreen',
        purpose: 'Testing Home Event Firebase Home Analytics',
      });
      Alert.alert('Success', 'Comviva Home Event sent to Firebase Analytics!');
    } catch (error) {
      console.error('❌ Failed to log event:', error);
    }
  };

  const handleCopy = () => {
    Clipboard.setString(deviceToken);
    Alert.alert('Copied', 'Text copied to clipboard!');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={triggerEvent}>
        <Text style={styles.text}>Trigger Event</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={triggerHomeEvent}>
        <Text style={styles.text}>Trigger Home Event</Text>
      </TouchableOpacity>
      <Text style={{color: 'black', margin: 10, fontWeight: 'bold'}}>
        Device Token
      </Text>
      <Text style={{color: 'red', margin: 10, marginTop: 0}}>
        {deviceToken}
      </Text>
      {!!deviceToken && (
        <TouchableOpacity style={styles.button} onPress={handleCopy}>
          <Text style={styles.buttonText}>Copy</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  button: {
    backgroundColor: '#1F2155',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  text: {color: '#fff', fontWeight: '600', fontSize: 16},
  buttonText: {color: '#fff', fontWeight: 'bold'},
});
