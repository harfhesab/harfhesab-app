import React, { useMemo } from 'react';
import FloatingCard from './FloatingCard';
import { useDragDrop } from '../context/DragDropContext';


const FloatingCardList = () => {
  const { data } = useDragDrop();
  const letters = data?.letters
  const renderedCards = useMemo(() => {
    return letters.map((letter:string, index:number) => (
      <FloatingCard key={`${letter}_${index}`} letter={letter} index={index} />
    ));
  }, [letters]);

  return <>{renderedCards}</>;
};

export default React.memo(FloatingCardList);