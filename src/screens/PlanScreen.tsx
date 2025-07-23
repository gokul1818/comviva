import React, {useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import {getAnalytics, logEvent} from '@react-native-firebase/analytics';
import {getApp} from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import DeviceInfo from 'react-native-device-info';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';

const plans = [
  {id: '1', name: 'Basic Plan', price: 99},
  {id: '2', name: 'Standard Plan', price: 199},
  {id: '3', name: 'Premium Plan', price: 299},
  {id: '4', name: 'Pro Plan', price: 399},
  {id: '5', name: 'Ultimate Plan', price: 499},
];

const PlanScreen = () => {
  useFocusEffect(
    useCallback(() => {
      const logPlanScreenEvent = async () => {
        try {
          const deviceId = await DeviceInfo.getUniqueId();
          const analytics = getAnalytics(getApp());
          const timestamp = Date.now();
          const screenRef = database().ref(`/screens/planScreen/${deviceId}`);

          const snapshot = await screenRef.once('value');

          if (!snapshot.exists()) {
            await logEvent(analytics, 'plan_screen_event');
            await screenRef.set({timestamp});
            console.log('✅ Login screen event logged');
          } else {
            console.log(
              'ℹ️ Login screen event already exists for this device.',
            );
          }
        } catch (err) {
          console.error('❌ Error logging login screen event:', err);
        }
      };

      logPlanScreenEvent();
    }, []),
  );

  const handlePurchase = async (plan: {
    id?: string;
    name: string;
    price: number;
  }) => {
    try {
      const analytics = getAnalytics(getApp());
      const deviceId = await DeviceInfo.getUniqueId();
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      const emailKey = await AsyncStorage.getItem('emailKey'); // get email-safe key
      const transactionId = `TXN-${Math.floor(Math.random() * 1000000)}`;
      const timestamp = Date.now();

      if (!emailKey) {
        Alert.alert(
          'Login Required',
          'User information not found. Please log in again.',
        );
        return;
      }

      // 🔥 Log to Firebase Analytics
      await logEvent(analytics, 'purchase_event', {
        item: plan.name,
        price: plan.price,
      });

      await logEvent(analytics, 'purchase_success_event', {
        success: true,
        transaction_id: transactionId,
      });

      // 📝 Save to Firebase Realtime Database under a fixed path
      await database()
        .ref(`/events/purchases/${emailKey}`)
        .set({
          event: 'purchase_success_event',
          planName: plan.name,
          price: plan.price,
          transactionId,
          timestamp,
          deviceId,
          fcmToken: fcmToken || '',
        });

      Alert.alert('✅ Success', `${plan.name} purchased`);
    } catch (error) {
      console.error('❌ Error writing event to DB:', error);
      Alert.alert('❌ Error', 'Failed to complete purchase.');
    }
  };

  const renderItem = ({item}: {item: (typeof plans)[0]}) => (
    <View style={styles.card}>
      <Text style={styles.planName}>{item.name}</Text>
      <Text style={styles.price}>₹{item.price}</Text>
      <TouchableOpacity
        style={styles.buyButton}
        onPress={() => handlePurchase(item)}>
        <Text style={styles.buyText}>Buy Plan</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#e87e40" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Plans</Text>
        <Text style={styles.subHeader}>Choose your best fit</Text>
      </View>

      <FlatList
        data={plans}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default PlanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  header: {
    backgroundColor: '#e87e40',
    paddingTop: Platform.OS === 'ios' ? 54 : 18,
    paddingBottom: 20,
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 16,
  },
  buyButton: {
    backgroundColor: '#F3901D',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buyText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
