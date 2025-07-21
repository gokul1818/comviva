import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native';
import {getAnalytics, logEvent} from '@react-native-firebase/analytics';
import {getApp} from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';

const plans = [
  {id: '1', name: 'Basic Plan', price: 99},
  {id: '2', name: 'Standard Plan', price: 199},
  {id: '3', name: 'Premium Plan', price: 299},
  {id: '4', name: 'Pro Plan', price: 399},
  {id: '5', name: 'Ultimate Plan', price: 499},
];

const PlanScreen = () => {
  const handlePurchase = async (plan: { id?: string; name: any; price: any; }) => {
    try {
      const analytics = getAnalytics(getApp());
      const deviceId = await DeviceInfo.getUniqueId(); // ✅ Ensure it's a string
      const transactionId = Math.floor(Math.random() * 1000000);
      const timestamp = Date.now();

      // Log Firebase events
      await logEvent(analytics, 'purchase_event', {
        item: plan.name,
        price: plan.price,
      });

      await logEvent(analytics, 'purchase_success_event', {
        success: true,
        transaction_id: transactionId,
      });

      // Write to Realtime Database
      await database()
        .ref(`/events/purchases/${deviceId}`) // ✅ String path
        .push({
          event: 'purchase_success_event',
          planName: plan.name,
          price: plan.price,
          transactionId,
          timestamp,
        });

      Alert.alert('Success', `${plan.name} purchased and saved to DB!`);
    } catch (error) {
      console.error('❌ Error writing event to DB:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Plan</Text>
      <FlatList
        data={plans}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePurchase(item)}>
            <Text style={styles.text}>
              {item.name} - ₹{item.price}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{paddingBottom: 40}}
      />
    </View>
  );
};

export default PlanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  button: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#1F2155',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  text: {color: '#fff', fontSize: 16},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},
});
