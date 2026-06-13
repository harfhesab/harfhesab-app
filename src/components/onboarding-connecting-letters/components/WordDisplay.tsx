import React, { memo, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useLetters } from '../context/LettersContext';
import Font from '../../../utils/Font';
import WordPlaceholderRow from './word-display/WordPlaceholderRow';

const { width } = Dimensions.get('screen');


const chunkArray = (arr: any[], size: number) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const WordDisplay = () => {
  const { 
    data, 
    foundWords, 
  } = useLetters();

  const chunks = useMemo(() => chunkArray(data.additional_words, 6), [data.additional_words]);
  
  const {  WORD_SQUARE_WIDTH } = useMemo(() => {
    const letterCount = data?.letters?.length || 0;
    if (letterCount === 0) return { CARD_WIDTH: 35, CARD_FONT_SIZE: 20, WORD_SQUARE_WIDTH: 40, WORD_SQUARE_FONT_SIZE: 25 };
    
    const calculation = (width - (30 + (letterCount - 1) * 5)) / letterCount;
    const finalCardWidth = calculation < 20 ? calculation : 20;
    const finalWordSquareWidth = calculation < 35 ? calculation : 35;
    return {
      CARD_WIDTH: finalCardWidth,
      CARD_FONT_SIZE: finalCardWidth / 1.6,
      WORD_SQUARE_WIDTH: finalWordSquareWidth,
      WORD_SQUARE_FONT_SIZE: finalWordSquareWidth / 1.6,
    };
  }, [data?.letters?.length]);
  

  return (
    <View style={styles.container}>
      <View style={{flex:1, flexDirection: 'column', alignItems:'center', justifyContent:'space-between'}}>
        <View style={styles.placeholdersContainer}>
          <View style={styles.rowContainer}>
            {chunks.map((chunk, colIndex) => (
              <View key={colIndex} style={styles.columnContainer}>
                {chunk.map((word: any, index: number) => (
                  <WordPlaceholderRow
                    key={index.toString()}
                    word={word}
                    isWordFound={foundWords.additional.has(word)}
                    size={WORD_SQUARE_WIDTH - 17}
                    mainWord={false}
                  />
                ))}
              </View>
            ))}
          </View>
          
            {/* کلمه اصلی */}
            <View style={{width:'100%', marginTop: 20, alignSelf:'center', alignItems:'center' }}>
              <WordPlaceholderRow
                word={data.word}
                isWordFound={foundWords.main}
                size={WORD_SQUARE_WIDTH}
                mainWord={true}
              />
            </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholdersContainer: {
    width: "100%",
    alignItems: "center",
  },
  rowContainer: {
    width: '100%',
    alignItems:'flex-end',
    flexDirection: "row",
    gap: 20,
  },
  columnContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
  },
  displayArea: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    gap: 5,
    marginTop:5
  },
  cardsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    gap: 5,
  },
  wordGradient: {
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 3
  },
  wordText: {
    fontFamily: Font.bakh_black,
    fontSize: 18,
    color: "#FFF",
  },
});

export default memo(WordDisplay);