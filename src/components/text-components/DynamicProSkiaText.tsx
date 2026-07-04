import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { 
  Canvas, 
  Skia, 
  Paragraph, 
  useFonts, 
  TextAlign, 
  TextDirection 
} from '@shopify/react-native-skia';

interface DynamicProSkiaTextProps {
  text: string;
  maxWidth?: number;      // حداکثر عرض مجاز (اختیاری). اگر ندهید، عرض صفحه در نظر گرفته می‌شود
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fontSize?: number;
}

// گرفتن عرض کل صفحه به عنوان مقدار پیش‌فرض
const SCREEN_WIDTH = Dimensions.get('window').width;

const DynamicProSkiaText: React.FC<DynamicProSkiaTextProps> = ({ 
  text,
  maxWidth = SCREEN_WIDTH - 40, // یک حاشیه امن پیش‌فرض (۲۰ پیکسل از هر طرف)
  textColor = '#FFFFFF',
  borderColor = '#3a194d',
  borderWidth = 1.5,
  fontSize = 24,
}) => {

  const customFontMgr = useFonts({
    'YekanBakh': [require('../../assets/fonts/YekanBakhFaNum-Black.ttf')]
  });

  const { fillParagraph, borderParagraph, paraHeight, paraWidth } = useMemo(() => {
    if (!customFontMgr) return { fillParagraph: null, borderParagraph: null, paraHeight: 0, paraWidth: 0 };

    const parsedTextColor = Skia.Color(textColor);
    const parsedBorderColor = Skia.Color(borderColor);

    const paddingForBorder = borderWidth * 2;
    // عرض مفیدی که پاراگراف اجازه دارد در آن متن را بشکند
    const availableMaxWidth = maxWidth - paddingForBorder;

    const buildPara = (color: Float32Array) => {
      const builder = Skia.ParagraphBuilder.Make({
        textAlign: TextAlign.Center, 
        textDirection: TextDirection.RTL,
      }, customFontMgr);

      builder.pushStyle({
        fontFamilies: ['YekanBakh'],
        fontSize: fontSize,
        color: color,
      });

      builder.addText(text); 
      const p = builder.build();
      
      // ۱. ابتدا پاراگراف را با حداکثر عرض مجاز شکل می‌دهیم (سطرشکنی انجام می‌شود)
      p.layout(availableMaxWidth); 
      return p;
    };

    const pFill = buildPara(parsedTextColor);
    const pBorder = buildPara(parsedBorderColor);

    // 🌟 ۲. جادوی محاسبه داینامیک: گرفتن عرضِ دقیقِ متن
    // getLongestLine() عرض دقیق طولانی‌ترین خط را برمی‌گرداند (چه متن یک خطی باشد، چه چند خطی)
    const exactTextWidth = pFill.getLongestLine();

    return {
      fillParagraph: pFill,
      borderParagraph: pBorder,
      // ۳. به عرض و ارتفاع محاسبه شده، فضای لازم برای بوردر را هم اضافه می‌کنیم
      // از Math.ceil استفاده می‌کنیم تا اعشار پیکسلی باعث بریده شدن میلی‌متری لبه‌ها نشود
      paraWidth: Math.ceil(exactTextWidth + paddingForBorder),
      paraHeight: Math.ceil(pFill.getHeight() + paddingForBorder),
    };
  }, [customFontMgr, text, textColor, borderColor, maxWidth, fontSize, borderWidth]);

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
    /* 🌟 حالا View دقیقا هم‌سایز خود متن (Shrink-wrap) می‌شود */
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