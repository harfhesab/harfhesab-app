import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { 
  Canvas, 
  Group, 
  Skia, 
  vec, 
  Paragraph, 
  TextAlign, 
  TextDirection,
  Mask,
  Rect,
  LinearGradient
} from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
// مسیر این ایمپورت را بر اساس ساختار پوشه‌های خود تنظیم کنید
import { useGlobalFonts } from '../../context/SkiaFontProvider';

interface AnimatedSkiaTextProps {
  text: string;
  fontSize: SharedValue<number>;
  initialFontSize: number;
  initialWidth: number;
  initialHeight: number;
  rtl?: boolean;
  gradientColors?: string[];
  borderColor?: string;
  borderWidth?: number;
  fontName?: string;
}

const AnimatedSkiaText: React.FC<AnimatedSkiaTextProps> = ({ 
  text,
  fontSize,
  initialFontSize,
  initialWidth,
  initialHeight,
  rtl = true,
  gradientColors = ['#9d34da', '#3800b9'],
  borderColor = '#FFFFFF',
  borderWidth = 1,
  fontName = 'YekanBakh-Black',
}) => {

  // 🌟 دریافت مدیر فونت از کانتکست گلوبال
  const { customFontMgr } = useGlobalFonts();

  const scale = useDerivedValue(() => fontSize.value / initialFontSize, [fontSize]);
  const transform = useDerivedValue(() => [{ scale: scale.value }], [scale]);

  // تبدیل رنگ‌ها به فرمت قابل فهم برای Skia
  const parsedBorderColor = useMemo(() => Skia.Color(borderColor), [borderColor]);
  const parsedWhiteColor = useMemo(() => Skia.Color('#FFFFFF'), []);

  const { maskParagraph, borderParagraph, paraHeight, paraWidth } = useMemo(() => {
    if (!customFontMgr) return { maskParagraph: null, borderParagraph: null, paraHeight: 0, paraWidth: 0 };

    const maxWidth = initialWidth * 0.95;

    // یک تابع سازنده برای تولید پاراگراف با رنگ‌های Solid (بدون Paint)
    const buildPara = (color: Float32Array) => {
      const builder = Skia.ParagraphBuilder.Make({
        textAlign: TextAlign.Center,
        textDirection: rtl ? TextDirection.RTL : TextDirection.LTR,
      }, customFontMgr); // 👈 مدیر فونت پاس داده شد

      builder.pushStyle({
        fontFamilies: [fontName], // 👈 نام فونت به صورت داینامیک اعمال می‌شود
        fontSize: initialFontSize,
        color: color, 
      });

      builder.addText(text); 
      const p = builder.build();
      p.layout(maxWidth); 
      return p;
    };

    // ساخت دو پاراگراف: یکی برای حاشیه (با رنگ بوردر) و یکی برای ماسک (رنگ سفید)
    const pBorder = buildPara(parsedBorderColor);
    const pMask = buildPara(parsedWhiteColor);

    return {
      maskParagraph: pMask,
      borderParagraph: pBorder,
      paraHeight: pBorder.getHeight(),
      paraWidth: maxWidth
    };
  }, [customFontMgr, text, rtl, initialFontSize, initialWidth, parsedBorderColor, parsedWhiteColor, fontName]); // 👈 fontName اضافه شد

  if (!customFontMgr || !maskParagraph || !borderParagraph) {
    return null;
  }

  const x = (initialWidth - paraWidth) / 2;
  const y = (initialHeight - paraHeight) / 2;
  
  // محاسبه مختصات برای افکت Stroke با استفاده از ۸ کپی از متن
  const d = borderWidth;
  const strokeOffsets = [
    [-d, -d], [0, -d], [d, -d],
    [-d,  0],          [d,  0],
    [-d,  d], [0,  d], [d,  d]
  ];

  return (
    <Canvas style={styles.canvas}>
      <Group transform={transform}>
        
        {/* لایه اول: استروک (Stroke) */}
        {/* رسم چندین باره‌ی پاراگراف با جابه‌جایی‌های ریز برای ایجاد حاشیه */}
        {strokeOffsets.map(([dx, dy], index) => (
          <Paragraph 
            key={`stroke-${index}`}
            paragraph={borderParagraph} 
            x={x + dx} 
            y={y + dy} 
            width={paraWidth} 
          />
        ))}

        {/* لایه دوم: گرادیانت روی متن اصلی */}
        {/* استفاده از Paragraph به عنوان یک ماسک برای بُرش دادن مستطیل گرادیانت‌دار */}
        <Mask
          mask={
            <Paragraph 
              paragraph={maskParagraph} 
              x={x} 
              y={y} 
              width={paraWidth} 
            />
          }
        >
          <Rect x={x} y={y} width={paraWidth} height={paraHeight}>
            <LinearGradient
              start={vec(0, y)}
              end={vec(0, y + paraHeight)}
              colors={gradientColors}
            />
          </Rect>
        </Mask>
        
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

export default memo(AnimatedSkiaText);