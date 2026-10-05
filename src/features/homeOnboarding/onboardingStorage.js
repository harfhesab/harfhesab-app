// src/features/onboarding/onboardingStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  WELCOME_SEEN: 'home_welcome_seen',
};

export const onboardingStorage = {
  async hasSeenWelcome() {
    try {
      return (await AsyncStorage.getItem(KEYS.WELCOME_SEEN)) === 'true';
    } catch (e) {
      return true;
    }
  },

  async markWelcomeSeen() {
    try {
      await AsyncStorage.setItem(KEYS.WELCOME_SEEN, 'true');
    } catch (e) {
      null
    }
  },
};