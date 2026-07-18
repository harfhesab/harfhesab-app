import React, { createContext, useContext, ReactNode } from 'react';
// 🌟 تغییر اول: SkTypefaceFontProvider اضافه شد
import { useFonts, SkTypefaceFontProvider } from '@shopify/react-native-skia'; 
import { ProvidersLoader } from '../components/loader/ProvidersLoader';

interface FontContextType {
  // 🌟 تغییر دوم: تایپ اصلاح شد
  customFontMgr: SkTypefaceFontProvider; 
}

export const FontContext = createContext<FontContextType | null>(null);

interface SkiaFontProviderProps {
  children: ReactNode;
}

export const SkiaFontProvider = ({ children }: SkiaFontProviderProps) => {
  const customFontMgr = useFonts({
    'YekanBakh-Bold': [require('../assets/fonts/YekanBakhFaNum-Bold.ttf')],
    'YekanBakh-ExtraBold': [require('../assets/fonts/YekanBakhFaNum-ExtraBold.ttf')],
    'YekanBakh-Black': [require('../assets/fonts/YekanBakhFaNum-Black.ttf')],
    'YekanBakh-ExtraBlack': [require('../assets/fonts/YekanBakhFaNum-ExtraBlack.ttf')],
    'IranSans-Bold': [require('../assets/fonts/IRANSans(FaNum)_Bold.ttf')],
  });

  if (!customFontMgr) {
    return <ProvidersLoader/>;
  }

  return (
    <FontContext.Provider value={{ customFontMgr }}>
      {children}
    </FontContext.Provider>
  );
};

export const useGlobalFonts = () => {
  const context = useContext(FontContext);
  if (!context) {
    throw new Error("useGlobalFonts must be used within a SkiaFontProvider");
  }
  return context;
};