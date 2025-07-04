import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GradientTextProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  colors?: string[]; // default: two-color gradient
  width?: number | `${number}%`;
  height?: number;
  x?: number;
  y?: number;
}

const GradientText: React.FC<GradientTextProps> = ({
  text,
  fontSize = 36,
  fontFamily = 'System',
  colors = ['#FF512F', '#DD2476'],
  width = '100%',
  height,
  x = 0,
  y,
}) => {
  const gradientId = `grad-${Math.random().toString(36).substring(7)}`;
  const defaultHeight = fontSize * 1.5;

  const containerStyle: ViewStyle = {
    width,
    height: height || defaultHeight,
  };

  return (
    <View style={containerStyle}>
      <Svg height="100%" width="100%">
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {colors.map((color, index) => (
              <Stop
                key={index}
                offset={`${(index / (colors.length - 1)) * 100}%`}
                stopColor={color}
                stopOpacity="1"
              />
            ))}
          </LinearGradient>
        </Defs>
        <SvgText
          fill={`url(#${gradientId})`}
          fontSize={fontSize}
          fontFamily={fontFamily}
          fontWeight="bold"
          x={x}
          y={y || fontSize}
        >
          {text}
        </SvgText>
      </Svg>
    </View>
  );
};

export default GradientText;
