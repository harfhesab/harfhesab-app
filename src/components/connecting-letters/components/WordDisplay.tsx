import React, { memo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useDragDrop } from '../context/DragDropContext';
import Font from '../../../utils/Font';
import useAppTheme from '../../../hooks/theme/useAppTheme';

const WordDisplay = ({data}: any) => {
  const { word } = useDragDrop();
  const colors = useAppTheme();

  const currentWord = word.join('');

  return (
    <View style={styles.wordContainer}>
      <Text style={[styles.wordText, { color: colors.text.a1 }]}>
        {currentWord}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wordContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    fontSize: 24,
    fontFamily: Font.black,
    textAlign: 'center',
  },
});

export default memo(WordDisplay);