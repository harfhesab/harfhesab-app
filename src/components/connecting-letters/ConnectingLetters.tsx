import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LettersProvider } from './context/LettersContext';
import WordDisplay from './components/WordDisplay';
import LetterBoard from './components/board/LetterBoard';
import { BOARD_BOTTOM_MARGIN } from './constants/constants';
import type { ConnectingLettersProps } from './types';

export type { ConnectingLettersProps } from './types';
/**
 * اختیاری: فونت حروف را زودتر بارگذاری می‌کند (مثلاً در شروع اپ یا صفحه‌ی انتخاب مرحله). با import
 * شدن همین ماژول هم خودکار شروع می‌شود؛ صدا زدنش فقط آن را زودتر جلو می‌اندازد.
 */
export { preloadLetterFont as preloadConnectingLetters } from './utils/letterFont';

/**
 * بازی «اتصال حروف»: کارت‌های حروف مثل توپ‌های بیلیارد روی صفحه حرکت می‌کنند و به هم برخورد
 * می‌کنند؛ لمس پشت‌سرهم آن‌ها یک کلمه می‌سازد که با تمام شدن تایمر انتخاب بررسی می‌شود.
 */
function ConnectingLetters(props: ConnectingLettersProps) {
  return (
    <LettersProvider {...props}>
      <View style={styles.container}>
        <WordDisplay />
        <View style={styles.board}>
          <LetterBoard />
        </View>
      </View>
    </LettersProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  board: {
    marginTop: 8,
    marginBottom: BOARD_BOTTOM_MARGIN,
  },
});

export default memo(ConnectingLetters);
