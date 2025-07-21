import React from 'react';
import {View, Text, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import {getAnalytics, logEvent} from '@react-native-firebase/analytics';
import {getApp} from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';

const RechargeScreen = () => {
  const handleRecharge = async () => {
    try {
      const analytics = getAnalytics(getApp());
      const deviceId = await DeviceInfo.getUniqueId(); // ✅ ensure it's a string
      const transactionId = Math.floor(Math.random() * 1000000);
      const timestamp = Date.now();

      // 1. Log event to Firebase Analytics
      await logEvent(analytics, 'recharge_event', {
        amount: 100,
        method: 'credit_card',
      });

      // 2. Save to Realtime Database
      await database()
        .ref(`/events/recharges/${deviceId}`)
        .push({
          event: 'recharge_event',
          amount: 100,
          method: 'credit_card',
          transactionId,
          timestamp,
        });

      Alert.alert('Recharge Logged', 'Recharge event sent and stored in DB');
    } catch (error) {
      console.error('❌ Error saving recharge to DB:', error);
      Alert.alert('Error', 'Recharge failed to log or store.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recharge</Text>
      <TouchableOpacity style={styles.button} onPress={handleRecharge}>
        <Text style={styles.text}>Recharge Now</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RechargeScreen;

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  button: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#1F2155',
    borderRadius: 8,
  },
  text: {color: '#fff', fontSize: 16},
  title: {fontSize: 24, fontWeight: 'bold'},
});
