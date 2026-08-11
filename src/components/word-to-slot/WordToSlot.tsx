import React, { memo } from 'react';
import { View, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DragDropProvider } from './context/DragDropContext';
import FloatingCardList from './components/FloatingCardList';
import DropZoneList from './components/DropZoneList';
import {
  BOUNDARY_HEIGHT,
  BOUNDARY_WIDTH,
  BOUNDARY_BORDER_RADIUS,
  SLOT_GAP,
  BOUNDARY_BOTTOM_OFFSET,
  DISTANCE_BOUNDARY_AND_SLOT
} from './constants/constants';
import SentenceDisplay from './components/SentenceDisplay';

const WordToSlot = ({
  id,
  type,
  data,
  saveWordHelpUsed,
  saveCompletedPartAndSentenceBuilded,
  endOfAStage,
  onPressUnknownWord
}:{
  id:string;
  type:string; // "stage-game" | "package-game" | "kalam-akhar"
  data:any;
  saveWordHelpUsed:(partIndex:number, wordId:any)=>void;
  saveCompletedPartAndSentenceBuilded:(partIndex:number)=>void;
  endOfAStage:()=>void;
  onPressUnknownWord:(partIndex:number, wordId:any)=>void;
}) => {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DragDropProvider
        stageId={id}
        type={type}
        data={data}
        saveWordHelpUsed={saveWordHelpUsed}
        saveCompletedPartAndSentenceBuilded={saveCompletedPartAndSentenceBuilded}
        endOfAStage={endOfAStage}
        onPressUnknownWord={onPressUnknownWord}
      >
        <SafeAreaView style={styles.container}>
          <SentenceDisplay />
          <View style={{ gap: DISTANCE_BOUNDARY_AND_SLOT }}>
            <View style={styles.dropZoneContainer}>
              <DropZoneList />
            </View>
            <ImageBackground
                  source={require("../../assets/image/border_1.png")}
                  style={{ width: BOUNDARY_WIDTH, height: BOUNDARY_HEIGHT, justifyContent: "center", alignItems: "center", marginBottom: BOUNDARY_BOTTOM_OFFSET}}
                  imageStyle={{ resizeMode: "stretch" }}
                  resizeMode="stretch"
              >
            <View style={[styles.boundaryContainer]}>
              <FloatingCardList />
            </View>
            </ImageBackground>
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
    justifyContent: 'space-between',
  },
  boundaryContainer: {
    height: BOUNDARY_HEIGHT,
    width: BOUNDARY_WIDTH,
    borderRadius: BOUNDARY_BORDER_RADIUS,
    zIndex: 0,
    overflow: 'visible',
  },
  dropZoneContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: SLOT_GAP,
    justifyContent: 'center',
    width: BOUNDARY_WIDTH,
    zIndex: -1,
  },
});

export default memo(WordToSlot);