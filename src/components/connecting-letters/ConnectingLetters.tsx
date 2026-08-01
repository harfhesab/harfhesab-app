import React, { memo } from 'react';
import { View, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
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

interface Props {
  type: string;
  data: any;
  stageNumber: number | undefined;
  saveMainWordBuilded:()=>void;
  saveNewAdditionalWordsBuilded:(word:string)=>void;
  saveNewHiddenWordsBuilded:(word:string)=>void;
  completedOperation:()=>void;
  saveUserHelpRequests:(newLettersHelpUsed:number[])=>void;
}
const ConnectingLetters = ({
  type,
  data,
  stageNumber,
  saveMainWordBuilded,
  saveNewAdditionalWordsBuilded,
  saveNewHiddenWordsBuilded,
  completedOperation,
  saveUserHelpRequests
}: Props) => {
  
  return (
    <View style={{ flex: 1 }}>
      <LettersProvider
        data={data}
        type={type}
        stageNumber={stageNumber}
        saveMainWordBuilded={saveMainWordBuilded}
        saveNewAdditionalWordsBuilded={(word)=>saveNewAdditionalWordsBuilded(word)}
        saveNewHiddenWordsBuilded={(word)=>saveNewHiddenWordsBuilded(word)}
        completedOperation={completedOperation}
        saveUserHelpRequests={(newLettersHelpUsed)=>saveUserHelpRequests(newLettersHelpUsed)}
      >
        <SafeAreaView style={styles.container}>
          <WordDisplay />
            <ImageBackground
                source={require("../../assets/image/border_2.png")}
                style={{ width: BOUNDARY_WIDTH, height: BOUNDARY_HEIGHT, justifyContent: "center", alignItems: "center", marginBottom: BOUNDARY_BOTTOM_OFFSET}}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
              <View style={styles.boundaryContainer}>
                <FloatingCardList/>
              </View>
            </ImageBackground>
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
    borderRadius: BOUNDARY_BORDER_RADIUS,
    zIndex: 0,
    overflow: 'visible',
  },
});

export default memo(ConnectingLetters);