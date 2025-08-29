import React, { memo, useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  SharedValue
} from 'react-native-reanimated';
import { useLetters } from '../context/LettersContext';
import Font from '../../../utils/Font';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import LinearGradient from 'react-native-linear-gradient';
import TextSkia from '../../text-components/TextSkia';


const { width } = Dimensions.get('window');

const WordDisplay = () => {
  

  return (
    <View style={styles.wordContainer}>
      
    </View>
  );
};

const styles = StyleSheet.create({
  wordContainer: {
    
  },
});

export default memo(WordDisplay);