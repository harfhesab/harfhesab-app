import React from 'react';
import { Canvas, RoundedRect, LinearGradient, vec, Shadow, useFont, Text } from '@shopify/react-native-skia';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { prepareRTLText } from '../../utils/prepareRTLText';

interface CapsuleButtonProps {
  text?: string;
  onPress?: () => void;
  width?: number;
  height?: number;
  borderRadius?: number;
  gradientColors?: string[];
  textColor?: string;
  fontSize?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffset?: { x: number; y: number };
  rtl?: boolean;
  ltr?: boolean;
}

const CapsuleButton: React.FC<CapsuleButtonProps> = ({
  text = 'Button',
  onPress,
  width = 200,
  height = 50,
  borderRadius,
  gradientColors = ['#c8e6c9', '#194d33'], // Light to dark green for depth, adjustable via props
  textColor = 'white',
  fontSize = 18,
  shadowColor = '#00000050',
  shadowBlur = 10,
  shadowOffset = { x: 0, y: 4 },
  rtl = true,
  ltr = false,
}) => {
  const effectiveRadius = borderRadius ?? height / 2; // Capsule shape by default
  const font = useFont(require('../../assets/fonts/IRANSans_Black.ttf'), fontSize);

  if (!font) {
    return null; // Font loading fallback
  }

  const renderedText = (rtl == true && ltr == false)?prepareRTLText(text):text;
  const textWidth = font.measureText(renderedText).width;
  const textX = (width - textWidth) / 2;
  const textY = (height + fontSize / 2) / 2; // Center vertically

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width, height, borderRadius: borderRadius}}
      activeOpacity={0.7}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={effectiveRadius}
        >
          <LinearGradient
            start={vec(width / 2, 0)}
            end={vec(width / 2, height)}
            colors={gradientColors}
          />
          {/* Outer shadow for depth/3D effect */}
          <Shadow
            dx={shadowOffset.x}
            dy={shadowOffset.y}
            blur={shadowBlur}
            color={shadowColor}
          />
          {/* Inner highlight for top bevel */}
          <Shadow
            dx={0}
            dy={-2}
            blur={5}
            color="rgba(255, 255, 255, 0.5)"
            inner
          />
          {/* Inner shadow for bottom bevel to create 3D border effect */}
          <Shadow
            dx={0}
            dy={2}
            blur={5}
            color="rgba(0, 0, 0, 0.4)"
            inner
          />
        </RoundedRect>
        {/* Text rendering */}
        <Text x={textX} y={textY} text={renderedText} font={font} color={textColor} />
      </Canvas>
    </TouchableOpacity>
  );
};

export default CapsuleButton;