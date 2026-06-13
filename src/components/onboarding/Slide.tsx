import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, StyleProp, TextStyle } from 'react-native';
import LottieView from 'lottie-react-native';
import FastImage from '@d11/react-native-fast-image';
import { SlideItem } from './types';

interface SlideProps {
  item: SlideItem;
  isRTL: boolean;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
}

export const Slide: React.FC<SlideProps> = ({ item, isRTL, titleStyle, descriptionStyle }) => {
  const { width } = useWindowDimensions();


  const writingDirection = isRTL ? 'rtl' : 'ltr';
  const CustomComponent = item?.CustomComponent;

  return (
    <View style={[styles.container, { width, backgroundColor: item?.backgroundColor??"transparent" }]}>
      <View style={styles.mediaContainer}>
        {CustomComponent ? (
          <CustomComponent/>
        ) : item.imageSource ? (
          <FastImage
            source={item.imageSource}
            style={(item?.imageStyle ?? styles.image) as any}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : item.lottieSource ? (
          <LottieView
            source={item.lottieSource}
            autoPlay
            loop
            style={styles.lottie}
            resizeMode="contain"
          />
        ) : null}
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { writingDirection }, titleStyle]}>
          {item.title}
        </Text>
        <Text style={[styles.description, { writingDirection }, descriptionStyle]}>
          {item.description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaContainer: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  lottie: {
    width: '80%',
    height: '100%',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  textContainer: {
    flex: 0.3,
    alignItems: 'center',
    paddingHorizontal: 25,
    width: '100%',
    justifyContent:'center'
  },
  title: {
    fontSize: 28,
    color: '#333',
    marginBottom: 16,
    width: '100%',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    width: '100%',
  },
});