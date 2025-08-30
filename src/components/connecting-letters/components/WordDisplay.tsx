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
  const { connectedLetters, data } = useLetters();
  const [wordColorStatus, setWordColorStatus] = useState<{
    cardColor: string;
    gradientColors: string[];
  }>({
    cardColor: '#ffd54f',
    gradientColors: ['#4d2719', '#86442d'],
  });


  const renderedWordDisplay = useMemo(() => {
    if (connectedLetters.length > 0){
      return (
        <LinearGradient colors={wordColorStatus.gradientColors} style={{ borderRadius: 5 }}>
          <View style={{ paddingHorizontal: 20 }}>
            <TextSkia
              text={connectedLetters.join('')}
              fontFamily={Font.bakh_black}
              borderWidth={1.5}
              fontSize={20}
            />
          </View>
        </LinearGradient>
      );
    }
  }, [connectedLetters]);


  return (
    <View style={styles.container}>
        <View>

        </View>
        <View>
          <View
            style={{
              width: width,
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 10,
              paddingBottom: 5,
              height: 85,
            }}
          >
            <View
              style={{
                flexDirection: 'row-reverse',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 15,
                gap: 10,
              }}
            >
              {renderedCards}
            </View>
            {renderedWordDisplay}
          </View>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'space-between',
  },
});

export default memo(WordDisplay);