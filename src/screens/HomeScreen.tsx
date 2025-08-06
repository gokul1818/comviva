import AsyncStorage from '@react-native-community/async-storage';
import database from '@react-native-firebase/database';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { generateUUID } from '../helpers';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const HomeScreen = ({navigation}) => {
  useFocusEffect(
    useCallback(() => {
      const logHomeScreenEvent = async () => {
        try {
          const fcmToken = await AsyncStorage.getItem('fcmToken');
          const deviceId = await DeviceInfo.getUniqueId();
          const timestamp = Date.now();
          const emailKey = await AsyncStorage.getItem('emailKey');
          const uniqueId = generateUUID();

          // ✅ Log to Realtime DB: screens/HomeScreen/{deviceId}
          const screenRef = database().ref(`/screens/home_screen`);
          const eventlistRef = database().ref(`/eventList/home_screen`);
          await eventlistRef.set({timestamp, eventName: 'home_screen'});
          await screenRef.set({timestamp});
          // ✅ Log event to: events/screens/home/{deviceId}
          const homeEventRef = database().ref(`events/${uniqueId}`);
          const eventSnapshot = await homeEventRef.once('value');
          const userRef = database().ref(`users/${emailKey}`);
          const userSnapshot = await userRef.once('value');
          const createdAt = new Date().toISOString();
          const userData = userSnapshot.val();
          const {user_id, email} = userData;

          const homeEvent = {
            unique_id: uniqueId,
            user_id: user_id,
            device_token: deviceId,
            email: email,
            event: 'home_screen',
            screen_name: 'home_screen',
            fcm_token: fcmToken || '',
            email_id: email.replace('@', '_').replace('.', '_'),
            timestamp: timestamp.toString(),
            count: 0,
            notification_status: 'pending',
            createdAt: createdAt,
            updatedAt: createdAt,
          };

          if (!eventSnapshot.exists()) {
            await homeEventRef.set(homeEvent);
            console.log('✅ Home screen event logged in /events/screens/home');
          } else {
            await homeEventRef.update(homeEvent);
            console.log('🔁 Home screen event updated in /events/screens/home');
          }
        } catch (err) {
          console.error('❌ Error logging Home screen events:', err);
        }
      };

      logHomeScreenEvent();
    }, []),
  );

  return (
    <SafeAreaProvider style={styles.container}>

      {/* <StatusBar backgroundColor="#e87e40" barStyle="light-content" /> */}

      <View style={styles.header}>
        <Text style={styles.headerText}>Comviva</Text>
        <Text style={styles.subHeader}>Your telecom companion</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* <Text style={styles.title}>Welcome Back!</Text> */}

        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Recharge')}>
            <Text style={styles.cardIcon}>🔌</Text>
            <Text style={styles.cardText}>Recharge</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Plan')}>
            <Text style={styles.cardIcon}>📦</Text>
            <Text style={styles.cardText}>Plans</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => {}}>
            <Text style={styles.cardIcon}>💰</Text>
            <Text style={styles.cardText}>Balance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => {}}>
            <Text style={styles.cardIcon}>🔥</Text>
            <Text style={styles.cardText}>Hot Offers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => {}}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardText}>Usage</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => {}}>
            <Text style={styles.cardIcon}>⚙️</Text>
            <Text style={styles.cardText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#e87e40',
    paddingTop: Platform.OS === 'ios' ? 54 : 28,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  subHeader: {
    color: '#FFF',
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#222',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#a8a8a8ff',
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e87e40',
  },
});
