import React, { memo } from 'react';
import { TouchableOpacity, ImageBackground, StyleSheet, I18nManager } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LocalImageComponent from './image-components/LocalImageComponent';

function Switch({
  click,
  width = 100,
  disabled = false,
  value = false,
}) {
  const isRTL = I18nManager.isRTL;
  const translateX = useSharedValue(value ? (isRTL ? -width * 0.5 : width * 0.5) : 0);

  React.useEffect(() => {
    translateX.value = withTiming(
      value ? (isRTL ? -width * 0.5 : width * 0.5) : 0,
      { duration: 500, easing: Easing.out(Easing.exp) }
    );
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const thumbImage = value
    ? require('../assets/image/progres_thumb_blue.png')
    : require('../assets/image/circle_button2.png');

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => click?.(!value)}
    >
      <ImageBackground
        source={require('../assets/image/frame_stage_button.png')}
        style={[styles.bg, { width, height: width * 0.35 }]}
        imageStyle={{ resizeMode: 'stretch' }}
        resizeMode="stretch"
      >
        <Animated.View style={[animatedStyle, styles.thumb]}>
          <LocalImageComponent
            path={thumbImage}
            width={width * 0.5}
            height={width * 0.5}
            resizeMode="stretch"
            blank_background
          />
        </Animated.View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bg: { justifyContent: 'center', paddingHorizontal: 5 },
  thumb: { position: 'absolute' },
});

export default memo(Switch);
