import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { 
  Canvas, 
  Skia, 
  Paragraph, 
  TextAlign, 
  TextDirection 
} from '@shopify/react-native-skia';
// مسیر این ایمپورت را بر اساس ساختار پوشه‌های خود تنظیم کنید
import { useGlobalFonts } from '../../context/SkiaFontProvider'; 

interface DynamicProSkiaTextProps {
  text: string;
  maxWidth?: number;      
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fontSize?: number;
  fontName?: string; // 👈 پراپ جدید برای دریافت داینامیک فونت
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const DynamicProSkiaText: React.FC<DynamicProSkiaTextProps> = ({ 
  text,
  maxWidth = SCREEN_WIDTH - 40, 
  textColor = '#FFFFFF',
  borderColor = '#3a194d',
  borderWidth = 1.5,
  fontSize = 24,
  fontName = 'YekanBakh-Black', // 👈 مقدار پیش‌فرض مطابق با یکی از فونت‌های کانتکست
}) => {

  // 🌟 مدیر فونت را از کانتکست سراسری اپلیکیشن می‌گیریم
  const { customFontMgr } = useGlobalFonts();

  const { fillParagraph, borderParagraph, paraHeight, paraWidth } = useMemo(() => {
    if (!customFontMgr) return { fillParagraph: null, borderParagraph: null, paraHeight: 0, paraWidth: 0 };

    const parsedTextColor = Skia.Color(textColor);
    const parsedBorderColor = Skia.Color(borderColor);

    const paddingForBorder = borderWidth * 2;
    const availableMaxWidth = maxWidth - paddingForBorder;

    const buildPara = (color: Float32Array) => {
      const builder = Skia.ParagraphBuilder.Make({
        textAlign: TextAlign.Center, 
        textDirection: TextDirection.RTL,
      }, customFontMgr); // 👈 مدیر فونت پاس داده شد

      builder.pushStyle({
        fontFamilies: [fontName], // 👈 استفاده از نام فونت دریافتی
        fontSize: fontSize,
        color: color,
      });

      builder.addText(text); 
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
  }, [customFontMgr, text, textColor, borderColor, maxWidth, fontSize, borderWidth, fontName]); // 👈 fontName به وابستگی‌ها اضافه شد

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