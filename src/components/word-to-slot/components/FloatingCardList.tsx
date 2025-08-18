import React, { useMemo } from 'react';
import { View } from 'react-native';
import FloatingCard from './FloatingCard';
import { useDragDrop } from '../context/DragDropContext';
import { BOUNDARY_HEIGHT } from '../constants/constants';
import { WaveIndicator } from 'react-native-indicators';

const FloatingCardList = () => {
  const { currentWords, playingPartIndex, lockedPan } = useDragDrop();

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

  return (
    <View style={{width:"100%", height:"100%"}}>
      <>{renderedCards}</>
      {
        lockedPan&&
        <View style={{position:"absolute", alignItems:'center', justifyContent:'center', width:"100%", height:"100%", zIndex:3000}}>
          <WaveIndicator
            color={`#FFFFFF50`}
            size={BOUNDARY_HEIGHT}
            count={3}
            animationDuration={2000}
            waveMode="fill"
          />
        </View>
      }
    </View>
  );
};

export default React.memo(FloatingCardList);