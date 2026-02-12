import React from 'react';
import { View } from 'react-native';
import PlaceholderSquare from './PlaceholderSquare';


interface WordPlaceholderRowProps {
  word: string;
  isWordFound: boolean;
  size: number;
  mainWord: boolean;
  numberHelped?: number;
}
const WordPlaceholderRow = ({ word, isWordFound, size, mainWord, numberHelped = 0 }: WordPlaceholderRowProps) => {
    return (
        <View style={{flexDirection: 'row-reverse', gap: mainWord?5:3 }}>
          {word.split('').map((char, index) => (
            <PlaceholderSquare
              key={`${word}-${index}`}
              letter={char}
              isRevealed={isWordFound}
              size={size}
              mainWord={mainWord}
              helped={index + 1 <= numberHelped?true:false }
            />
          ))}
        </View>
    );
};

export default React.memo(WordPlaceholderRow);