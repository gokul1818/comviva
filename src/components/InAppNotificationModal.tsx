import React from 'react';
import {
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-community/async-storage';

type InAppNotificationModalProps = {
  visible: boolean;
  title?: string;
  body?: string;
  onClose: () => void;
  data?: {
    cardBackgroundColor?: string;
    titleTextColor?: string;
    bodyTextColor?: string;
    button1_text?: string;
    button2_text?: string;
    button1Color?: string;
    button2Color?: string;
    button1TextColor?: string;
    button2TextColor?: string;
    image?: string;
    layoutType?: string;
    button2_action?: any;
    button1_action?: any;
    button1Event?: any;
    button2Event?: any;
  };
};

const InAppNotificationModal: React.FC<InAppNotificationModalProps> = ({
  visible,
  title,
  body,
  onClose,
  data = {},
}) => {
  const {
    cardBackgroundColor = '#FFFFFF',
    titleTextColor = '#000000',
    bodyTextColor = '#666666',
    button1_text = 'View',
    button2_text = 'Dismiss',
    button1Color = '#007AFF',
    button2Color = '#6C757D',
    button1TextColor = '#FFFFFF',
    button2TextColor = '#FFFFFF',
    button2_action,
    button1_action,
    button1Event,
    button2Event,
    image,
    layoutType = 'card',
  } = data;
  console.log('layoutType: ', layoutType);

  const handleButtonClick = async (deeplink, event) => {
    const deviceId = await DeviceInfo.getUniqueId();
    const emailKey = await AsyncStorage.getItem('emailKey');
    const fcmToken = await AsyncStorage.getItem('fcmToken');
    const timestamp = Date.now();

    if (deeplink) {
      Linking.openURL(deeplink);
    }
    if (event) {
      const screenRef = database().ref(
        `/events/inAppNotificationButtonAction/${emailKey}`,
      );
      const screenSnapshot = await screenRef.once('value');

      await screenRef.set({
        timestamp,
        action: deeplink,
        fcmToken,
        deviceId,
        emailKey,
      });
      console.log('✅ Event logged to Firebase');
    }
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <View
        style={[
          styles.overlay,
          layoutType === 'card' && styles.centeredOverlay,
          layoutType === 'screenblocker' && styles.screenBlockerOverlay,
        ]}>
        <View
          style={[
            styles.container,
            {backgroundColor: cardBackgroundColor},
            layoutType === 'FULLSCREEN' && styles.fullscreenContainer,
            layoutType === 'header' && styles.headerContainer,
            layoutType === 'footer' && styles.footerContainer,
          ]}>
          {image && (
            <Image
              source={{uri: image}}
              style={[
                styles.image,
                layoutType === 'FULLSCREEN' && styles.fullscreenImage,
              ]}
              resizeMode="contain"
            />
          )}
          {Boolean(title) && (
            <Text style={[styles.title, {color: titleTextColor}]}>{title}</Text>
          )}
          {Boolean(body) && (
            <Text style={[styles.body, {color: bodyTextColor}]}>{body}</Text>
          )}

          {layoutType !== 'screenblocker' && (
            <View style={styles.buttonRow}>
              {Boolean(button2_text) && (
                <TouchableOpacity
                  onPress={() => {
                    handleButtonClick(button2_action, button2Event);
                    onClose();
                  }}
                  style={[styles.button, {backgroundColor: button2Color}]}>
                  <Text style={[styles.buttonText, {color: button2TextColor}]}>
                    {button2_text}
                  </Text>
                </TouchableOpacity>
              )}
              {Boolean(button1_text) && (
                <TouchableOpacity
                  onPress={() => {
                    handleButtonClick(button1_action, button1Event);
                    onClose();
                  }}
                  style={[styles.button, {backgroundColor: button1Color}]}>
                  <Text style={[styles.buttonText, {color: button1TextColor}]}>
                    {button1_text}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default InAppNotificationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // paddingTop: 80,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  centeredOverlay: {
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingTop: 0,
  },
  screenBlockerOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: '90%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  fullscreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 0,
    padding: 24,
    justifyContent: 'center',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerContainer: {
    width: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    position: 'absolute',
    top: 0,
  },
  footerContainer: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 16,
    position: 'absolute',
    bottom: 0,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  fullscreenImage: {
    height: 250,
    borderRadius: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  body: {
    fontSize: 15,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '600',
  },
});
