import React, { memo, useCallback } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useLettersStatic } from '../context/LettersContext';
import TopHeader from './word-display/TopHeader';
import WordSlots from './word-display/WordSlots';
import CurrentWord from './word-display/CurrentWord';
import SelectionTimer from './word-display/SelectionTimer';
import HiddenWordEffect from './word-display/HiddenWordEffect';

/** هر چیزی بالای صفحه‌ی بازی: هدر، خانه‌های کلمات، کلمه‌ی در حال ساخت و تایمرش. */
function WordDisplay() {
  const { hiddenFx } = useLettersStatic();
  // جای نوار «کلمه‌ی فعلی»: افکت کلمه‌ی پنهان از همین‌جا شروع به پرواز می‌کند.
  const onCurrentWordLayout = useCallback(
    (event: LayoutChangeEvent) => {
      hiddenFx.currentWordY.value = event.nativeEvent.layout.y;
    },
    [hiddenFx],
  );

  return (
    <View style={styles.container}>
      <TopHeader />
      <WordSlots />
      <View style={styles.currentWord} onLayout={onCurrentWordLayout}>
        <CurrentWord />
      </View>
      <SelectionTimer />
      <HiddenWordEffect />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  currentWord: {
    width: '100%',
  },
});

export default memo(WordDisplay);
