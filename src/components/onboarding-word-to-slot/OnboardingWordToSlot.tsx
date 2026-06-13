import React, { memo } from 'react';
import { View, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { OnboardingProvider } from './context/OnboardingContext';
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

const OnboardingWordToSlot = ({
  data,
}:{
  data:any;
}) => {

  return (
      <OnboardingProvider
        data={data}
      >
        <SafeAreaView style={styles.container}>
          <View style={{ gap: DISTANCE_BOUNDARY_AND_SLOT, paddingTop:30 }}>
            
            <SentenceDisplay />
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
      </OnboardingProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 0,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    direction: 'ltr'
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

export default memo(OnboardingWordToSlot);