import React, { useMemo } from 'react';
import DropZone from './DropZone';
import { useDragDrop } from '../context/DragDropContext';

const DropZoneList = () => {
  const { currentWords } = useDragDrop();

  const renderedZones = useMemo(() => {
    return currentWords?.map((item, index) => (
      <DropZone
        key={index}
        index={index}
        word_help_used={item.word_help_used}
        word={item.word}
        unknown_word={item.unknown_word}
        unknown_word_completed={item.unknown_word_completed}
      />
    ));
  }, [currentWords]);

  return <>{renderedZones}</>;
};

export default React.memo(DropZoneList);