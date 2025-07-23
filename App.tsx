import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {getApp} from '@react-native-firebase/app';
import {getMessaging, onMessage} from '@react-native-firebase/messaging';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RechargeScreen from './src/screens/RechargeScreen';
import PlanScreen from './src/screens/PlanScreen';
import CreateAccountScreen from './src/screens/CreateAccountScreens';
import {requestUserPermission} from './pushNotificationHelper';

import InAppNotificationModal from './src/components/InAppNotificationModal'; 

const Stack = createStackNavigator();
const linking = {
  prefixes: ['myapp://', 'https://mydomain.com'],
  config: {
    screens: {
      Home: 'home',
      Profile: 'profile/:id',
    },
  },
};
const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationData, setNotificationData] = useState({title: '', body: ''});

  const showNotification = (title, body) => {
    setNotificationData({title, body});
    setModalVisible(true);
    setTimeout(() => setModalVisible(false), 5000); // auto-dismiss
  };

  useEffect(() => {
    requestUserPermission();

    const unsubscribe = onMessage(getMessaging(getApp()), async remoteMessage => {
      console.log('📨 Foreground notification:', remoteMessage);
      const title = remoteMessage?.notification?.title || 'Notification';
      const body = remoteMessage?.notification?.body || 'You have a new message.';
      showNotification(title, body);
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName="Login" screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Recharge" component={RechargeScreen} />
          <Stack.Screen name="Plan" component={PlanScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      <InAppNotificationModal
        visible={modalVisible}
        title={notificationData.title}
        body={notificationData.body}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

export default App;
