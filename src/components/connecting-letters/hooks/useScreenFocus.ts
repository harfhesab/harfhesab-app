import { useContext, useEffect, useState } from 'react';
import { NavigationContext } from '@react-navigation/native';

/**
 * آیا صفحه‌ی میزبان در فوکوس است. Stack navigator صفحه‌های زیرین را mount نگه می‌دارد؛ بدون
 * این، فیزیک زیر صفحه‌ی بعدی هم اجرا می‌شد و باتری مصرف می‌کرد.
 * بیرون از navigator همیشه `true` برمی‌گرداند.
 */
export function useScreenFocus(): boolean {
  const navigation = useContext(NavigationContext);
  const [focused, setFocused] = useState(() => navigation?.isFocused() ?? true);

  useEffect(() => {
    if (!navigation) {
      return;
    }
    setFocused(navigation.isFocused());
    const unsubscribeFocus = navigation.addListener('focus', () => setFocused(true));
    const unsubscribeBlur = navigation.addListener('blur', () => setFocused(false));
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
    };
  }, [navigation]);

  return focused;
}
