import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, AppState, AppStateStatus } from 'react-native';
import { 
  Canvas, 
  Skia, 
  Paragraph, 
  TextAlign, 
  TextDirection 
} from '@shopify/react-native-skia';
import { useGlobalFonts } from '../../context/SkiaFontProvider'; 

interface DynamicProSkiaTextProps {
  text: string;
  maxWidth?: number;      
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fontSize?: number;
  fontName?: string; 
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const DynamicProSkiaText: React.FC<DynamicProSkiaTextProps> = ({ 
  text,
  maxWidth = SCREEN_WIDTH - 40, 
  textColor = '#FFFFFF',
  borderColor = '#3a194d',
  borderWidth = 1,
  fontSize = 24,
  fontName = 'YekanBakh-Black',
}) => {
  const { customFontMgr } = useGlobalFonts();
  
  // 🌟 اضافه شدن لیسنر برای وضعیت اپلیکیشن (اکتیو بودن یا در بک‌گراند بودن)
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const { fillParagraph, borderParagraph, paraHeight, paraWidth } = useMemo(() => {
    if (!customFontMgr) return { fillParagraph: null, borderParagraph: null, paraHeight: 0, paraWidth: 0 };

    // 🌟 جلوگیری از کرش موتور اسکیا به خاطر رشته خالی
    const safeText = (text && text.length > 0) ? text : ' ';

    const parsedTextColor = Skia.Color(textColor);
    const parsedBorderColor = Skia.Color(borderColor);

    const paddingForBorder = borderWidth * 2;
    const availableMaxWidth = maxWidth - paddingForBorder;

    const buildPara = (color: Float32Array) => {
      const builder = Skia.ParagraphBuilder.Make({
        textAlign: TextAlign.Center, 
        textDirection: TextDirection.RTL,
      }, customFontMgr);

      builder.pushStyle({
        fontFamilies: [fontName], 
        fontSize: fontSize,
        color: color,
      });

      builder.addText(safeText); 
      const p = builder.build();
      
      p.layout(availableMaxWidth); 
      return p;
    };

    const pFill = buildPara(parsedTextColor);
    const pBorder = buildPara(parsedBorderColor);

    const exactTextWidth = pFill.getLongestLine();

    return {
      fillParagraph: pFill,
      borderParagraph: pBorder,
      paraWidth: Math.ceil(exactTextWidth + paddingForBorder),
      paraHeight: Math.ceil(pFill.getHeight() + paddingForBorder),
    };
  }, [customFontMgr, text, textColor, borderColor, maxWidth, fontSize, borderWidth, fontName, appState]); 
  // 👆 appState به وابستگی‌ها اضافه شد تا با بازگشت به برنامه پاراگراف‌ها رفرش شوند

  if (!customFontMgr || !fillParagraph || !borderParagraph) {
    return null;
  }

  const d = borderWidth;
  const strokeOffsets = [
    [-d, -d], [0, -d], [d, -d],
    [-d,  0],          [d,  0],
    [-d,  d], [0,  d], [d,  d]
  ];

  return (
    <View style={{ width: paraWidth, height: paraHeight }}>
      <Canvas style={styles.canvas}>
        {strokeOffsets.map(([dx, dy], index) => (
          <Paragraph 
            key={`stroke-${index}`}
            paragraph={borderParagraph} 
            x={d + dx} 
            y={d + dy} 
            width={paraWidth} 
          />
        ))}
        <Paragraph 
          paragraph={fillParagraph} 
          x={d} 
          y={d} 
          width={paraWidth} 
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default DynamicProSkiaText;