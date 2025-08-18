import React, { useMemo } from 'react';
import FloatingCard from './FloatingCard';
import { useDragDrop } from '../context/DragDropContext';

const FloatingCardList = () => {
  const { currentWords, playingPartIndex } = useDragDrop();

  const renderedCards = useMemo(() => {
    console.log('Rendering cards for words:', currentWords);
    return currentWords.map((item, index) => (
      <FloatingCard
        key={`${item.word}_${index}_${playingPartIndex}`}
        _id={item._id}
        word={item.word}
        index={index}
        unknown_word={item.unknown_word}
        unknown_word_completed={item.unknown_word_completed}
      />
    ));
  }, [playingPartIndex]);

  return <>{renderedCards}</>;
};

export default React.memo(FloatingCardList);