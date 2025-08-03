import React, { memo, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DragDropProvider, useDragDrop } from './context/DragDropContext';
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
import LinearGradient from 'react-native-linear-gradient';
import useAppTheme from '../../hooks/theme/useAppTheme';

const words = ["بابا", "با", "اسب", "با", "سرعت زیادی", "آمد"];


const {width, height} = Dimensions.get("window")
const WordToSlot = () => {
  const colors = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DragDropProvider>
        <SafeAreaView style={styles.container}>
          <SentenceDisplay words={words} />
          <View style={{ gap: DISTANCE_BOUNDARY_AND_SLOT }}>
            <View style={styles.dropZoneContainer}>
              <DropZoneList count={words.length} />
            </View>
            <View style={styles.boundaryContainer}>
              <FloatingCardList words={words} />
            </View>
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
    marginBottom: BOUNDARY_BOTTOM_OFFSET,
    borderWidth: BOUNDARY_BORDER_WIDTH,
    borderColor: '#ff6f61',
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