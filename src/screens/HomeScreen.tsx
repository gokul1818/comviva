import React, {useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, StatusBar} from 'react-native';
import {getAnalytics, logEvent} from '@react-native-firebase/analytics';
import {getApp} from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';

const HomeScreen = ({navigation}) => {
  useEffect(() => {
    const logHomeEvent = async () => {
      try {
        const analytics = getAnalytics(getApp());
        const deviceId = await DeviceInfo.getUniqueId();
        const timestamp = Date.now();

        await logEvent(analytics, 'home_screen_event');

        await database()
          .ref(`/events/screens/${deviceId}`)
          .push({
            event: 'home_screen_event',
            timestamp,
          });

      } catch (err) {
        console.error('❌ Error logging home event:', err);
      }
    };

    logHomeEvent();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#D81F25" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerText}>MyTelco</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back!</Text>

        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('Recharge')}>
          <Text style={styles.buttonText}>🔌 Recharge Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => navigation.navigate('Plan')}>
          <Text style={styles.buttonText}>📦 Choose a Plan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    backgroundColor: '#D81F25',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  headerText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
    color: '#222',
  },
  cardButton: {
    backgroundColor: '#FFF',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D81F25',
    textAlign: 'center',
  },
});
