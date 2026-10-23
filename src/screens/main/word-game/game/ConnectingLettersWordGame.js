import React, { useMemo } from 'react';
import {StyleSheet, View, Text, SafeAreaView, StatusBar} from 'react-native';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import ConnectingLetters from '../../../../components/connecting-letters/ConnectingLetters';
import NightSky from '../../../../components/particles/NightSky';
import { useConnectingLetterStageGameMusic } from '../../../../utils/sound/MusicFunctions';
import { useRealm } from '../../../../realm';
import { getWordGameStageById } from '../../../../realm/repositories/word-game/word-game-stage.repository';
import { endOfAStageInWordGame } from '../../../../components/connecting-letters/functions/WordGameFunctions';
import { saveNewHiddenWordsBuildedInWordGame, saveNewWordsBuildedInWordGame, saveUserHelpRequestsInWordGame } from '../../../../realm/repositories/user/user-word-game-progress.repository';
import { useImmersiveMode } from '../../../../hooks/useImmersiveMode';
import { useDispatch, useSelector } from 'react-redux';

function ConnectingLettersWordGame(props){
    useImmersiveMode()
    useConnectingLetterStageGameMusic()
    const dispatch = useDispatch();
    const colors = useAppTheme()
    const realm = useRealm();
    const stageId = props?.route?.params?.stageId
    const { lastStage, lastStageNumber } = useSelector((state) => state.wordGame);

    const stageData = useMemo(
        () => getWordGameStageById(realm, stageId),
        [realm, stageId]
    );
    const stageNumber = stageData.stage_number_in_language

    const saveMainWordBuilded = ()=>{
        null
    }
    const saveNewAdditionalWordsBuilded = (word)=>{
        saveNewWordsBuildedInWordGame( realm, stageId, word );
    }
    const saveNewHiddenWordsBuilded = (word)=>{
        saveNewHiddenWordsBuildedInWordGame( realm, stageId, word );
    }
    const completedOperation = ()=>{
        const language_ref = stageData?.language_ref?.toHexString();
        const currentStageId = lastStage;
        const stageNumber = stageData.stage_number_in_language;
        setTimeout(async()=>{
            endOfAStageInWordGame({dispatch, realm, language_ref, stageId, currentStageId, stageNumber})
        }, 1500)
    }
    const saveUserHelpRequests = (newLettersHelpUsed)=>{
        saveUserHelpRequestsInWordGame(
            realm,
            stageId,
            newLettersHelpUsed
        );
    }
    
    return(
        <SafeAreaView style={{flex:1, backgroundColor:"#000000"}}>
            <StatusBar translucent={true} hidden={true} />
            <NightSky>
                <View style={styles.container}>
                    <ConnectingLetters 
                        type={"word-game"}
                        data={stageData}
                        stageNumber={stageNumber}
                        saveMainWordBuilded={saveMainWordBuilded}
                        saveNewAdditionalWordsBuilded={saveNewAdditionalWordsBuilded}
                        saveNewHiddenWordsBuilded={saveNewHiddenWordsBuilded}
                        completedOperation={completedOperation}
                        saveUserHelpRequests={saveUserHelpRequests}
                    />
                </View>
            </NightSky>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      direction: "ltr"
    },
});
export default ConnectingLettersWordGame;