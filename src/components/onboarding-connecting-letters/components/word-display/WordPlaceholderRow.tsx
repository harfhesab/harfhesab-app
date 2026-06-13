import React from 'react';
import { View } from 'react-native';
import PlaceholderSquare from './PlaceholderSquare';


interface WordPlaceholderRowProps {
  word: string;
  isWordFound: boolean;
  size: number;
  mainWord: boolean;
}
const WordPlaceholderRow = ({ word, isWordFound, size, mainWord }: WordPlaceholderRowProps) => {
    return (
        <View style={{flexDirection: 'row-reverse', gap: mainWord?5:3 }}>
          {word.split('').map((char, index) => (
            <PlaceholderSquare
              key={`${word}-${index}`}
              letter={char}
              isRevealed={isWordFound}
              size={size}
              mainWord={mainWord}
            />
          ))}
        </View>
    );
};

export default React.memo(WordPlaceholderRow);