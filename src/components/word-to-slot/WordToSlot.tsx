import React, { memo } from 'react';
import { View, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DragDropProvider } from './context/DragDropContext';
import FloatingCardList from './components/FloatingCardList';
import DropZoneList from './components/DropZoneList';
import {
  BOUNDARY_TOP_OFFSET,
  BOUNDARY_HORIZONTAL_OFFSET,
  BOUNDARY_HEIGHT,
  BOUNDARY_WIDTH,
  BOUNDARY_BORDER_RADIUS,
  BOUNDARY_BORDER_WIDTH,
  SLOT_GAP,
  SLOT_BOTTOM_OFFSET,
  BOUNDARY_BOTTOM_OFFSET,
  DISTANCE_BOUNDARY_AND_SLOT
} from './constants/constants';
import SentenceDisplay from './components/SentenceDisplay';
import useAppTheme from '../../hooks/theme/useAppTheme';

const WordToSlot = ({
  id,
  currentStageId,
  type,
}:{
  id:string;
  currentStageId:string;
  type:string; // "stage-game" | "package-game"
}) => {
  const colors = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DragDropProvider
        stageId={id}
        currentStageId={currentStageId}
        type={type}
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