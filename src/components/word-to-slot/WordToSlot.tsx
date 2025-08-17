import React, { memo } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
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
import { getStageById } from '../../realm/repositories/stage-game/stage.repository';
import { useRealm } from '../../realm';

const WordToSlot = ({
  id,
  type
}:{
  id:string;
  type:string; // "stage-game" | "package-game"
}) => {
  const colors = useAppTheme();
  const realm = useRealm();

  const data = type == "stage-game"? getStageById(realm, id)?.parts:[]

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DragDropProvider parts={data??[]} realm={realm} stageId={id} type={type}>
        <SafeAreaView style={styles.container}>
          <SentenceDisplay />
          <View style={{ gap: DISTANCE_BOUNDARY_AND_SLOT }}>
            <View style={styles.dropZoneContainer}>
              <DropZoneList />
            </View>
            <View style={[styles.boundaryContainer, {borderColor:colors.primary.a1}]}>
              <FloatingCardList />
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