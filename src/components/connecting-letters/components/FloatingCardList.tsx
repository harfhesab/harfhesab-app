import React, { useMemo } from 'react';
import FloatingCard from './FloatingCard';

interface Props {
  letters: string[];
}

const FloatingCardList = ({ letters }: Props) => {
  const renderedCards = useMemo(() => {
    return letters.map((letter, index) => (
      <FloatingCard key={`${letter}_${index}`} letter={letter} index={index} />
    ));
  }, [letters]);

  return <>{renderedCards}</>;
};

export default React.memo(FloatingCardList);