import React, { useMemo } from 'react';
import { View } from 'react-native';
import FloatingCard from './FloatingCard';
import { useDragDrop } from '../context/OnboardingContext';

const FloatingCardList = () => {
  const { currentWords } = useDragDrop();

  const renderedCards = useMemo(() => {
    return currentWords.filter(item => item.assigned !== true).map((item, index) => (
      <FloatingCard
        key={`${item.word}_${index}`}
        word={item.word}
        index={index}
        unknown_word={item.unknown_word}
      />
    ));
  }, [currentWords]);

  return (
    <View style={{width:"100%", height:"100%"}}>
      {renderedCards}
    </View>
  );
};

export default React.memo(FloatingCardList);