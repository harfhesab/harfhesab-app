import React, { useMemo } from 'react';
import FloatingCard from './FloatingCard';
import { useLetters } from '../context/LettersContext';
import { BOUNDARY_WIDTH, BOUNDARY_HEIGHT, CARD_SIZE_FLOATING } from '../constants/constants';
import { generateInitialPositions } from '../utils/Generateinitialpositions';


const FloatingCardList = () => {
  const { data } = useLetters();
  const letters = data?.letters;

  const renderedCards = useMemo(() => {
    if (!letters || letters.length === 0) return null;

    // موقعیت‌های شروع همه‌ی کارت‌ها یک‌جا و هماهنگ محاسبه می‌شود (شبکه + jitter تصادفی)
    // تا در باکس پخش شوند، نه اینکه هرکدام مستقل و کاملاً تصادفی در یک محدوده‌ی ثابت
    // بیفتند و در فریم اول با هم تلنبار شوند.
    const positions = generateInitialPositions(
      letters.length,
      BOUNDARY_WIDTH - CARD_SIZE_FLOATING,
      BOUNDARY_HEIGHT - CARD_SIZE_FLOATING,
      CARD_SIZE_FLOATING
    );

    return letters.map((letter: string, index: number) => (
      <FloatingCard
        key={`${letter}_${index}`}
        letter={letter}
        index={index}
        initialPosition={positions[index]}
      />
    ));
  }, [letters]);

  return <>{renderedCards}</>;
};

export default React.memo(FloatingCardList);