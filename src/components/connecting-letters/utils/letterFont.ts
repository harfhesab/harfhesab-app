import { useEffect, useState } from 'react';
import { loadData, Skia, type SkTypeface } from '@shopify/react-native-skia';
import { LETTER_FONT } from '../constants/theme';

let typeface: SkTypeface | null = null;
let loading: Promise<SkTypeface | null> | null = null;

/**
 * فونت حروف را یک بار برای کل عمر اپ بارگذاری و نگه می‌دارد. `useTypeface` خودِ Skia در هر mount
 * فایل فونت را دوباره می‌خواند و parse می‌کند؛ به همین دلیل حروف با هر بار باز شدن صفحه دیر ظاهر
 * می‌شدند. اگر این تابع زودتر صدا زده شود (مثلاً در شروع اپ)، صفحه از همان فریم اول حروف را دارد.
 */
export function preloadLetterFont(): Promise<SkTypeface | null> {
  if (typeface) {
    return Promise.resolve(typeface);
  }
  if (!loading) {
    loading = Promise.resolve()
      .then(() => loadData(LETTER_FONT, data => Skia.Typeface.MakeFreeTypeFaceFromData(data)))
      .then(result => {
        typeface = result;
        return result;
      })
      .catch(error => {
        if (__DEV__) {
          console.warn('connecting-letters: could not load LETTER_FONT', error);
        }
        return null;
      })
      .finally(() => {
        loading = null;
      });
  }
  return loading;
}

/** فونت حروف؛ اگر قبلاً بارگذاری شده باشد همان رندر اول آماده است. */
export function useLetterTypeface(): SkTypeface | null {
  const [current, setCurrent] = useState(typeface);
  useEffect(() => {
    if (current) {
      return;
    }
    let alive = true;
    preloadLetterFont().then(result => {
      if (alive && result) {
        setCurrent(result);
      }
    });
    return () => {
      alive = false;
    };
  }, [current]);
  return current;
}

// بارگذاری از همان لحظه‌ای شروع می‌شود که این ماژول import شود (معمولاً هنگام شروع اپ).
preloadLetterFont();
