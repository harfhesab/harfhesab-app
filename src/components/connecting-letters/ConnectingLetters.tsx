import React, { memo } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { LettersProvider } from './context/LettersContext';
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
import useAppTheme from '../../hooks/theme/useAppTheme';
import { getStageById } from '../../realm/repositories/stage-game/stage.repository';
import { useRealm } from '../../realm';

interface Props {
  type: string;
  stageId: string;
  partIndex: number;
  wordId: string;
}
const ConnectingLetters = ({type, stageId, partIndex, wordId}: Props) => {
  const colors = useAppTheme();
  const realm = useRealm();
  

  const partWords = type == "stage-game"? getStageById(realm, stageId)?.parts[partIndex]?.words:undefined
  const wordIndex = partWords?.findIndex(w=>w._id.toString() == wordId)
  const data = wordIndex !== undefined && wordIndex > -1  && partWords? partWords[wordIndex]:undefined
  
  return (
    <View style={{ flex: 1 }}>
      <StatusBar hidden={true} />
      <LettersProvider 
        realm={realm}
        data={data}
        type={type}
        stageId={stageId}
        partIndex={partIndex}
        wordId={wordId}
      >
        <SafeAreaView style={styles.container}>
          <WordDisplay />
          <View style={styles.boundaryContainer}>
            <FloatingCardList/>
          </View>
        </SafeAreaView>
      </LettersProvider>
    </View>
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
    borderColor: '#0693e3',
    borderRadius: BOUNDARY_BORDER_RADIUS,
    zIndex: 0,
    overflow: 'visible',
  },
});

export default memo(ConnectingLetters);