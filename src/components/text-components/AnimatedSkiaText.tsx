import React from 'react';
import { Canvas, Text, useFont, Group } from '@shopify/react-native-skia';
import Animated, { useDerivedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

interface AnimatedSkiaTextProps {
  text: string;
  fontSize: Animated.SharedValue<number>;
}

const AnimatedSkiaText: React.FC<AnimatedSkiaTextProps> = ({ text, fontSize }) => {
  const initialFontSize = 24; // سایز اولیه فونت
  const font = useFont(require('../../assets/fonts/IRANSans_Black.ttf'), initialFontSize); // مسیر فونت را جایگزین کنید
  const scale = useDerivedValue(() => fontSize.value / initialFontSize, [fontSize]);
  const transform = useDerivedValue(() => [{ scale: scale.value }], [scale]);

  if (!font) {
    return null; // منتظر لود شدن فونت
  }

  return (
    <Canvas style={styles.canvas}>
      <Group transform={transform}>
        <Text
          text={text}
          font={font}
          x={0}
          y={initialFontSize / 2} // تنظیم موقعیت عمودی
          color="black"
        />
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default AnimatedSkiaText;