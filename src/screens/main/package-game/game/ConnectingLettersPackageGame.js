import React, { useMemo } from 'react';
import {StyleSheet, View, Text, SafeAreaView} from 'react-native';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import ConnectingLetters from '../../../../components/connecting-letters/ConnectingLetters';
import NightSky from '../../../../components/particles/NightSky';
import { useConnectingLetterPackageGameMusic } from '../../../../utils/sound/MusicFunctions';
import {
    saveMainWordBuildedInPackageGame,
    saveNewAdditionalWordsBuildedInPackageGame,
    saveNewHiddenWordsBuildedInPackageGame,
    saveUnknownWordCompletedInPackageGame,
    saveUserHelpRequestsInPackageGame
} from '../../../../realm/repositories/user/user-package-game-progress.repository';
import { unknownWordCompletedInPackageGame } from '../../../../components/connecting-letters/functions/PackageGameFunctions';
import { useRealm } from '../../../../realm';
import { getPackageStageById } from '../../../../realm/repositories/package-game/package-stage.repository';

function ConnectingLettersPackageGame(props){
    useConnectingLetterPackageGameMusic()
    const colors = useAppTheme()
    const realm = useRealm();
    const stageId = props?.route?.params?.stageId
    const partIndex = props?.route?.params?.partIndex
    const wordId = props?.route?.params?.wordId

      
    const stageData = useMemo(
        () => getPackageStageById(realm, stageId),
        [realm, stageId]
    );
    const partWords = stageData?.parts[partIndex]?.words
    const wordIndex = partWords?.findIndex(w=>w._id.toString() == wordId)
    const data =  partWords[wordIndex]
    const stageNumber = stageData.stage_number_in_package

    const saveMainWordBuilded = ()=>{
        saveMainWordBuildedInPackageGame( realm, stageId, partIndex, wordId );
    }
    const saveNewAdditionalWordsBuilded = (word)=>{
        saveNewAdditionalWordsBuildedInPackageGame( realm, stageId, partIndex, wordId, word );
    }
    const saveNewHiddenWordsBuilded = (word)=>{
        saveNewHiddenWordsBuildedInPackageGame( realm, stageId, partIndex, wordId, word );
    }
    const completedOperation = ()=>{
        saveUnknownWordCompletedInPackageGame( realm, stageId, partIndex, wordId );
        setTimeout(async()=>{
            unknownWordCompletedInPackageGame()
        }, 1500)
    }
    const saveUserHelpRequests = (newLettersHelpUsed)=>{
        saveUserHelpRequestsInPackageGame(
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
                        type={"package-game"}
                        data={data}
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
export default ConnectingLettersPackageGame;