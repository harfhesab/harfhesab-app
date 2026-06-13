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
import { getStageById } from '../../realm/repositories/stage-game/stage.repository';
import { useRealm } from '../../realm';
import { getPackageStageById } from '../../realm/repositories/package-game/package-stage.repository';
import { Stage } from '../../realm/schemas/stage-game/StageSchema';
import { PackageStage } from '../../realm/schemas/package-game/PackageStageSchema';

interface Props {
  data: any;
}
const OnboardingConnectingLetters = ({ data}: Props) => {
  const realm = useRealm();




  
  return (
    <View style={{ flex: 1, direction: 'ltr', paddingTop:30 }}>
      <LettersProvider 
        data={data}
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

export default memo(OnboardingConnectingLetters);