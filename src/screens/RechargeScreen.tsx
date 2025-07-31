import AsyncStorage from '@react-native-community/async-storage';
import {getAnalytics} from '@react-native-firebase/analytics';
import {getApp} from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

const RechargeScreen = () => {
  useFocusEffect(
    useCallback(() => {
      const logRechargeScreenEvent = async () => {
        try {
          const timestamp = Date.now();
          const screenRef = database().ref(`/screens/recharge_success`);
          const eventlistRef = database().ref(`/eventList/recharge_success`);
          await eventlistRef.set({timestamp, eventName: 'recharge_success'});
          await screenRef.set({timestamp});
        } catch (err) {
          console.error('❌ Error logging login screen event:', err);
        }
      };

      logRechargeScreenEvent();
    }, []),
  );

  const handleRecharge = async () => {
    try {
      const analytics = getAnalytics(getApp());
      const deviceId = await DeviceInfo.getUniqueId();
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const emailKey = await AsyncStorage.getItem('emailKey');

      if (!emailKey) {
        Alert.alert(
          'Login Required',
          'User information not found. Please log in again.',
        );
        return;
      }

      const transactionId = `TXN-${Math.floor(Math.random() * 1_000_000)}`;
      const timestamp = Date.now();
      const amount = 100;
      const method = 'credit_card';

      // 🔥 Log to Firebase Analytics
      // await logEvent(analytics, 'recharge_event', {
      //   emailKey,
      //   amount,
      //   method,
      //   transactionId,
      // });

      // 📝 Save to Realtime Database using set (replace existing if exists)
      await database()
        .ref(`/events/recharges/${emailKey}`)
        .set({
          event: 'recharge_success',
          amount,
          method,
          transactionId,
          timestamp,
          deviceId,
          fcmToken: fcmToken || '',
        });

      Alert.alert('✅ Success', 'Recharge Successfully Completed');
    } catch (error) {
      console.error('❌ Error saving recharge to DB:', error);
      Alert.alert('⚠️ Error', 'Recharge failed to log or store.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#e87e40" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Recharge</Text>
        <Text style={styles.subHeader}>Quick Top-Up</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>💳 Recharge Amount</Text>
        <Text style={styles.amount}>₹100</Text>

        <TouchableOpacity
          style={styles.rechargeButton}
          onPress={handleRecharge}>
          <Text style={styles.buttonText}>Recharge Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RechargeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
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
  card: {
    margin: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    color: '#444',
    fontWeight: '600',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    color: '#0e0e0eff',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  rechargeButton: {
    backgroundColor: '#F3901D',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
