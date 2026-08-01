import React, { useMemo } from 'react';
import {StyleSheet, View, Text, SafeAreaView} from 'react-native';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import ConnectingLetters from '../../../../components/connecting-letters/ConnectingLetters';
import NightSky from '../../../../components/particles/NightSky';
import { useConnectingLetterStageGameMusic } from '../../../../utils/sound/MusicFunctions';
import { useRealm } from '../../../../realm';
import { getStageById } from '../../../../realm/repositories/stage-game/stage.repository';
import {
    saveMainWordBuildedInStageGame,
    saveNewAdditionalWordsBuildedInStageGame,
    saveNewHiddenWordsBuildedInStageGame,
    saveUnknownWordCompletedInStageGame,
    saveUserHelpRequestsInStageGame
} from '../../../../realm/repositories/user/user-stage-game-progress.repository';
import { unknownWordCompletedInStageGame } from '../../../../components/connecting-letters/functions/StageGameFunctions';

function ConnectingLettersStageGame(props){
    useConnectingLetterStageGameMusic()
    const colors = useAppTheme()
    const realm = useRealm();
    const stageId = props?.route?.params?.stageId
    const partIndex = props?.route?.params?.partIndex
    const wordId = props?.route?.params?.wordId

    const stageData = useMemo(
        () => getStageById(realm, stageId),
        [realm, stageId]
    );
    const partWords = stageData?.parts[partIndex]?.words
    const wordIndex = partWords?.findIndex(w=>w._id.toString() == wordId)
    const data = partWords[wordIndex]
    const stageNumber = stageData.stage_number_in_language

    const saveMainWordBuilded = ()=>{
        saveMainWordBuildedInStageGame( realm, stageId, partIndex, wordId );
    }
    const saveNewAdditionalWordsBuilded = (word)=>{
        saveNewAdditionalWordsBuildedInStageGame( realm, stageId, partIndex, wordId, word );
    }
    const saveNewHiddenWordsBuilded = (word)=>{
        saveNewHiddenWordsBuildedInStageGame( realm, stageId, partIndex, wordId, word );
    }
    const completedOperation = ()=>{
        saveUnknownWordCompletedInStageGame( realm, stageId, partIndex, wordId );
        setTimeout(async()=>{
            unknownWordCompletedInStageGame()
        }, 1500)
    }
    const saveUserHelpRequests = (newLettersHelpUsed)=>{
        saveUserHelpRequestsInStageGame(
            realm,
            stageId,
            partIndex,
            wordId,
            newLettersHelpUsed
        );
    }
    
    return(
        <SafeAreaView style={{flex:1, backgroundColor:"#000000"}}>
            <NightSky>
                <View style={styles.container}>
                    <ConnectingLetters 
                        type={"stage-game"}
                        data={data}
                        stageNumber={stageNumber}
                        saveMainWordBuilded={saveMainWordBuilded}
                        saveNewAdditionalWordsBuilded={(word)=>saveNewAdditionalWordsBuilded(word)}
                        saveNewHiddenWordsBuilded={(word)=>saveNewHiddenWordsBuilded(word)}
                        completedOperation={completedOperation}
                        saveUserHelpRequests={(newLettersHelpUsed)=>saveUserHelpRequests(newLettersHelpUsed)}
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
export default ConnectingLettersStageGame;