// /components/FloatingCardList.tsx
import React, { useMemo } from 'react';
import FloatingCard from './FloatingCard';

interface Props {
  words: string[];
}

const FloatingCardList = ({ words }: Props) => {
  const renderedCards = useMemo(() => {
    console.log('Rendering cards for words:', words);
    return words.map((word, index) => (
      <FloatingCard
        key={`${word}_${index}`}
        word={word} index={index}
        numberOfCards={words.length}
      />
    ));
  }, [words]);

  return <>{renderedCards}</>;
};

export default React.memo(FloatingCardList);