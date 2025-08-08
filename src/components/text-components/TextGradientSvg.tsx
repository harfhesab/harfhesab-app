import React, { useEffect, useRef, useState } from 'react';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { View, Text, findNodeHandle, UIManager } from 'react-native';
import { convertRtl } from 'react-native-rtl-reshaper';
import Font from '../../utils/Font';

interface TextGradientSvgProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  colors?: string[];
  height?: number;
  x?: number;
  y?: number;
  rtl?: boolean;
  ltr?: boolean;
  paddingHorizontal?: number;
  paddingVertical?: number;
  borderWidth?: number;
  borderColor?: string;
}

const TextGradientSvg: React.FC<TextGradientSvgProps> = ({
  text,
  fontSize = 20,
  fontFamily = Font.medium,
  colors = ['#FF512F', '#DD2476'],
  height,
  x = 0,
  y,
  rtl = true,
  ltr = false,
  paddingHorizontal = 5,
  paddingVertical = 1,
  borderWidth = 0,
  borderColor = '#FFFFFF',
}) => {
  const [textWidth, setTextWidth] = useState<number | null>(null);
  const hiddenTextRef = useRef(null);

  const renderedText = rtl && !ltr ? convertRtl(text) : text;
  const gradientId = `grad-${Math.random().toString(36).substring(7)}`;

  useEffect(() => {
    if (hiddenTextRef.current) {
      const handle = findNodeHandle(hiddenTextRef.current);
      if (handle) {
        UIManager.measure(handle, (_x, _y, width) => {
          setTextWidth(width);
        });
      }
    }
  }, [renderedText, fontSize, fontFamily]);

  if (textWidth === null) {
    return (
      <Text
        style={{
          position: 'absolute',
          opacity: 0,
          fontSize,
          fontFamily,
        }}
        ref={hiddenTextRef}
      >
        {renderedText}
      </Text>
    );
  }

  const totalWidth = textWidth + paddingHorizontal * 2;
  const totalHeight = (height || fontSize * 1.5) + paddingVertical * 2;
  const textX = rtl && !ltr ? totalWidth - paddingHorizontal : paddingHorizontal;
  const textY = (y || fontSize) + paddingVertical;
  const textAnchor = rtl && !ltr ? 'end' : 'start';

  return (
    <View style={{ width: totalWidth, height: totalHeight }}>
      <Svg height={totalHeight} width={totalWidth}>
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

        {/* 👇 لایه زیرین: بوردر (چند بار رندر با slight offset برای شبیه‌سازی stroke) */}
        {borderWidth > 0 &&
          [-1, 1, 0, 0, -1, 1, -1, 1].map((offset, index) => (
            <SvgText
              key={index}
              fill={borderColor}
              fontSize={fontSize}
              fontFamily={fontFamily}
              x={textX + (index % 2 === 0 ? offset * borderWidth : 0)}
              y={textY + (index % 2 !== 0 ? offset * borderWidth : 0)}
              textAnchor={textAnchor}
            >
              {renderedText}
            </SvgText>
          ))}

        {/* 👇 لایه رویی: متن اصلی با گرادینت */}
        <SvgText
          fill={`url(#${gradientId})`}
          fontSize={fontSize}
          fontFamily={fontFamily}
          x={textX}
          y={textY}
          textAnchor={textAnchor}
        >
          {renderedText}
        </SvgText>
      </Svg>
    </View>
  );
};

export default TextGradientSvg;
