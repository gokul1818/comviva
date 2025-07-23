// src/components/InAppNotificationModal.js
import React from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const InAppNotificationModal = ({visible, title, body, onClose}) => {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title || 'Notification'}</Text>
          <Text style={styles.body}>{body || 'You have a new message.'}</Text>
          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default InAppNotificationModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  container: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
  button: {
    backgroundColor: '#e87e40',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
