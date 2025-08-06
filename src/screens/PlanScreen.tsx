import AsyncStorage from '@react-native-community/async-storage';
import {getAnalytics} from '@react-native-firebase/analytics';
import {getApp} from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { generateUUID } from '../helpers';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
          const timestamp = Date.now();
          const screenRef = database().ref(`/screens/purchase_success`);
          const eventlistRef = database().ref(`/eventList/purchase_success`);
          await eventlistRef.set({timestamp, eventName: 'purchase_success'});
          await screenRef.set({timestamp});
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
      // const analytics = getAnalytics(getApp());
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
     const userRef = database().ref(`users/${emailKey}`);
          const userSnapshot = await userRef.once('value');
          const createdAt = new Date().toISOString();
          const userData = userSnapshot.val();
          const {user_id, email} = userData;
          const uniqueId = generateUUID();

        const planEvent = {
            unique_id: uniqueId,
            user_id: user_id,
            device_token: deviceId,
            email: email,
            event: 'purchase_success',
            screen_name: 'purchase_success',
            fcm_token: fcmToken || '',
            email_id: email.replace('@', '_').replace('.', '_'),
            timestamp: timestamp.toString(),
            count: 0,
            notification_status: 'pending',
            createdAt: createdAt,
            updatedAt: createdAt,
          };

      await database()
        .ref(`/events/purchases/${emailKey}`)
        .set(planEvent);

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
    <SafeAreaProvider style={styles.container}>
      {/* <StatusBar backgroundColor="#e87e40" barStyle="light-content" /> */}
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
    </SafeAreaProvider>
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
    paddingTop: Platform.OS === 'ios' ? 54 : 28,
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
