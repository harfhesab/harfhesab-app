import React, { useMemo, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, AppState, AppStateStatus } from 'react-native';
import { 
  Canvas, 
  Skia, 
  Paragraph, 
  TextAlign, 
  TextDirection,
  PaintStyle,
  StrokeJoin,
  StrokeCap,
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

    const paddingForBorder = borderWidth * 2;
    const availableMaxWidth = maxWidth - paddingForBorder;

    // 🌟 پاراگراف اصلی (fill) - رنگ ساده، بدون تغییر نسبت به قبل
    const fillBuilder = Skia.ParagraphBuilder.Make({
      textAlign: TextAlign.Center, 
      textDirection: TextDirection.RTL,
    }, customFontMgr);

    fillBuilder.pushStyle({
      fontFamilies: [fontName], 
      fontSize: fontSize,
      color: parsedTextColor,
    });
    fillBuilder.addText(safeText); 
    const pFill = fillBuilder.build();
    pFill.layout(availableMaxWidth); 

    // 🌟 پاراگراف حاشیه (border) - با foregroundPaint استروک واقعی به‌جای رنگ ساده
    const strokePaint = Skia.Paint();
    strokePaint.setStyle(PaintStyle.Stroke);
    strokePaint.setStrokeWidth(borderWidth * 2); // stroke از مرکز کشیده می‌شه، برای حاشیه‌ی بیرونی معادل borderWidth دو برابرش می‌کنیم
    strokePaint.setColor(Skia.Color(borderColor));
    strokePaint.setStrokeJoin(StrokeJoin.Round);
    strokePaint.setStrokeCap(StrokeCap.Round);
    strokePaint.setAntiAlias(true);

    const borderBuilder = Skia.ParagraphBuilder.Make({
      textAlign: TextAlign.Center, 
      textDirection: TextDirection.RTL,
    }, customFontMgr);

    borderBuilder.pushStyle(
      {
        fontFamilies: [fontName], 
        fontSize: fontSize,
      },
      strokePaint, // 👈 foregroundPaint - این خط کیفیت حاشیه رو واقعی می‌کنه
    );
    borderBuilder.addText(safeText);
    const pBorder = borderBuilder.build();
    pBorder.layout(availableMaxWidth); 

    // 🌟 اندازه‌گیری همیشه از روی پاراگراف fill انجام می‌شه (استروک روی متریک تاثیر نمی‌ذاره)
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

  return (
    <View style={{ width: paraWidth, height: paraHeight }}>
      <Canvas style={styles.canvas}>
        {/* یک پاراگراف حاشیه (زیر) به‌جای ۸ کپی قبلی */}
        <Paragraph 
          paragraph={borderParagraph} 
          x={d} 
          y={d} 
          width={paraWidth} 
        />
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