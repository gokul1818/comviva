import {getApp} from '@react-native-firebase/app';
import {getMessaging, onMessage} from '@react-native-firebase/messaging';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';

import {requestUserPermission} from './pushNotificationHelper';
import CreateAccountScreen from './src/screens/CreateAccountScreens';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import PlanScreen from './src/screens/PlanScreen';
import RechargeScreen from './src/screens/RechargeScreen';

import 'react-native-url-polyfill/auto';
import InAppNotificationModal from './src/components/InAppNotificationModal';
import {Text} from 'react-native-gesture-handler';
import {Linking} from 'react-native';

const Stack = createStackNavigator();
const linking = {
  prefixes: ['comviva://', 'https://mydomain.com'],
  config: {
    screens: {
      Login: 'login',
      CreateAccount: 'create-account',
      Home: 'home',
      Recharge: 'recharge',
      Plan: 'plan',
    },
  },
};
const App = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    body: '',
  });

  const showNotification = (data = {}) => {
    const title = data?.title || data?.notification?.title || 'Notification';
    const body =
      data?.body || data?.notification?.body || 'You have a new message.';
    setNotificationData({...data, title, body});
    setModalVisible(true);
  };

  useEffect(() => {
    requestUserPermission();

    const unsubscribe = onMessage(
      getMessaging(getApp()),
      async remoteMessage => {
        console.log('📨 Foreground notification:', remoteMessage);
        const data = {
          ...remoteMessage?.data,
          title: remoteMessage?.notification?.title,
          body: remoteMessage?.notification?.body,
        };
        showNotification(data);
      },
    );

    return unsubscribe;
  }, []);



  return (
    <>
      <NavigationContainer
        linking={linking}
        fallback={<Text>Loading...</Text>}
        onStateChange={state => {
          console.log('New navigation state', JSON.stringify(state, null, 2));
        }}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{headerShown: false}}>
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
        onButton1Press={(deeplink) => {
          if (deeplink) {
           handleButtonClick(deeplink)
          }
        }}
        onButton2Press={(deeplink,event) => {
          if (deeplink) {
           handleButtonClick(deeplink)
          }
        }}
        onClose={() => setModalVisible(false)}
        data={notificationData}
      />
    </>
  );
};

export default App;
