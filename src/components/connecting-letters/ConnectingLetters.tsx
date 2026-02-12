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
  type: string;
  stageId: string;
  partIndex: number;
  wordId: string;
}
const ConnectingLetters = ({type, stageId, partIndex, wordId}: Props) => {
  const realm = useRealm();
  
  const stageData = type == "stage-game"? getStageById(realm, stageId):type == "package-game"?getPackageStageById(realm, stageId):undefined
  const partWords = stageData?.parts[partIndex]?.words
  const wordIndex = partWords?.findIndex(w=>w._id.toString() == wordId)
  const data = wordIndex !== undefined && wordIndex > -1  && partWords? partWords[wordIndex]:undefined


  let stageNumber: number | undefined;
  if (type === "stage-game" && stageData) {
    const stageGameData = stageData as Stage;
    stageNumber = stageGameData.stage_number_in_language;
  } else if (type === "package-game" && stageData) {
    const packageGameData = stageData as PackageStage;
    stageNumber = packageGameData.stage_number_in_package;
  }
  
  return (
    <View style={{ flex: 1 }}>
      <LettersProvider 
        realm={realm}
        data={data}
        type={type}
        stageId={stageId}
        partIndex={partIndex}
        wordId={wordId}
        stageNumber={stageNumber}
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