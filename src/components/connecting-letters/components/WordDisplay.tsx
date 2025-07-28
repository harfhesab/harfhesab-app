import React, { memo, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useDragDrop } from '../context/DragDropContext';
import Font from '../../../utils/Font';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import { WORD_DISPLAY_DURATION } from '../constants/constants';

interface Props {
  data: {
    word: string;
    letters: string[];
    additional_words: string[];
    hidden_words: string[];
  };
}

const WordDisplay = ({ data }: Props) => {
  const { word, draggedCardId, setWord } = useDragDrop();
  const colors = useAppTheme();
  const [displayedWord, setDisplayedWord] = useState<string>('');
  const [isValidWord, setIsValidWord] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // پاک کردن تایمر در صورت وجود
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // به‌روزرسانی فوری متن هنگام درگ
  useEffect(() => {
    if (draggedCardId) {
      clearTimer();
      setDisplayedWord(word.join(''));
      setIsValidWord(null); // پاک کردن وضعیت صحت هنگام درگ
    }
  }, [word, draggedCardId]);

  // بررسی صحت کلمه و نمایش ۳ ثانیه‌ای بعد از دراپ
  useEffect(() => {
    if (!draggedCardId && word.length > 0) {
      const currentWord = word.join('');
      const isValid =
        currentWord === data.word ||
        data.additional_words.includes(currentWord) ||
        data.hidden_words.includes(currentWord);

      setDisplayedWord(currentWord);
      setIsValidWord(isValid);

      // تنظیم تایمر برای پاک کردن متن و word بعد از ۳ ثانیه
      clearTimer();
      timerRef.current = setTimeout(() => {
        setDisplayedWord('');
        setIsValidWord(null);
        setWord([]); // پاک کردن word در context
      }, WORD_DISPLAY_DURATION);
    } else if (!draggedCardId && word.length === 0) {
      clearTimer();
      setDisplayedWord('');
      setIsValidWord(null);
    }

    // پاک کردن تایمر هنگام اتمام useEffect
    return clearTimer;
  }, [draggedCardId, word, data, setWord]);

  return (
    <View style={styles.wordContainer}>
      <View style={{height:50}}>
        <Text style={[styles.wordText,{color:isValidWord === null? colors.text.a1: isValidWord? colors.primary.a1: colors.alert.a1}]}>
          {displayedWord}
        </Text>
      </View>
      <View style={{flexDirection:'row-reverse', flexWrap: 'wrap', alignItems:'center', justifyContent: 'center', paddingHorizontal:15, gap:10, height:40}}>
        {displayedWord.split('').map((char, index) => (
          <View key={index.toString()} style={[styles.card, {backgroundColor:isValidWord === null?'#ffd54f':isValidWord? colors.primary.a1: colors.alert.a1}]}>
            <Text style={{fontSize:15, fontFamily:Font.black, color:isValidWord === null?"#000":"#FFF"}}>{char}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    fontSize: 24,
    fontFamily: Font.black,
    textAlign: 'center',
  },
  card: {
    alignItems:'center',
    justifyContent:'center',
    width:30,
    height:30,
    borderRadius:5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }
});

export default memo(WordDisplay);