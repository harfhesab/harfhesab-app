import React from 'react';
import { StyleSheet, View } from 'react-native';
import PlaceholderSquare from './PlaceholderSquare';


interface WordPlaceholderRowProps {
  word: string;
  isWordFound: boolean;
  size: number;
  mainWord: boolean;
}
const WordPlaceholderRow = ({ word, isWordFound, size, mainWord }: WordPlaceholderRowProps) => {
    return (
        <View style={styles.placeholderRow}>
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
const styles = StyleSheet.create({
    placeholderRow: {
        flexDirection: 'row-reverse',
        gap: 5,
    },
});

export default React.memo(WordPlaceholderRow);