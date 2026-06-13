import React, { useMemo } from 'react';
import DropZone from './DropZone';
import { useDragDrop } from '../context/OnboardingContext';

const DropZoneList = () => {
  const { currentWords } = useDragDrop();

  const renderedZones = useMemo(() => {
    return currentWords?.map((item, index) => (
      <DropZone
        key={index}
        index={index}
        word={item.word}
        unknown_word={item.unknown_word}
        assigned={item.assigned}
      />
    ));
  }, [currentWords]);

  return <>{renderedZones}</>;
};

export default React.memo(DropZoneList);