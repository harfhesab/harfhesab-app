import React from 'react';
import { StyleSheet, View } from 'react-native';
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
        <View style={styles.placeholderRow}>
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
const styles = StyleSheet.create({
    placeholderRow: {
        flexDirection: 'row-reverse',
        gap: 5,
    },
});

export default React.memo(WordPlaceholderRow);