import React, { memo } from 'react';
import { View, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DragDropProvider } from './context/DragDropContext';
import FloatingCardList from './components/FloatingCardList';
import WordDisplay from './components/WordDisplay';
import {
  BOUNDARY_TOP_OFFSET,
  BOUNDARY_HORIZONTAL_OFFSET,
  BOUNDARY_HEIGHT,
  BOUNDARY_WIDTH,
  BOUNDARY_BORDER_RADIUS,
  BOUNDARY_BORDER_WIDTH,
  BOUNDARY_BOTTOM_OFFSET,
} from './constants/constants';
import LinearGradient from 'react-native-linear-gradient';
import useAppTheme from '../../hooks/theme/useAppTheme';

const { width, height } = Dimensions.get('window');

interface DataModel {
  
}
const ConnectingLetters = () => {
  const colors = useAppTheme();
  const data = {
    game_type : "stage-game", // stage-geme | package-game
    stage : "_id",
    language : "_id",
    package : "_id",
    sentence : "_id",
    word : "کوی",
    word_builded : false,
    letters : ["ک", "و", "ی", "ب", "ل", "س"],
    additional_words : ["سیبوک", "کولی", "بیل", "سیب", "کولیبس"],
    hidden_words : ["سیل", "بوس"]
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DragDropProvider>
        <SafeAreaView style={styles.container}>
          <WordDisplay data={data}/>
          <View style={styles.boundaryContainer}>
            <FloatingCardList letters={data?.letters} />
          </View>
        </SafeAreaView>
      </DragDropProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  boundaryContainer: {
    height: BOUNDARY_HEIGHT,
    width: BOUNDARY_WIDTH,
    marginBottom: BOUNDARY_BOTTOM_OFFSET,
    borderWidth: BOUNDARY_BORDER_WIDTH,
    borderColor: '#fcb900',
    borderRadius: BOUNDARY_BORDER_RADIUS,
    zIndex: 0,
    overflow: 'visible',
  },
});

export default memo(ConnectingLetters);