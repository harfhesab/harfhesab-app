import React, { useCallback, useMemo } from 'react';
import {StyleSheet, View, Text, SafeAreaView} from 'react-native';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import ConnectingLetters from '../../../../components/connecting-letters/ConnectingLetters';
import NightSky from '../../../../components/particles/NightSky';
import { useConnectingLetterStageGameMusic } from '../../../../utils/sound/MusicFunctions';
import { useRealm } from '../../../../realm';
import { getHarfAkharChallengeById } from '../../../../realm/repositories/harf-akhar/harf-akhar-challenge.repository';
import {
    saveMainWordBuildedInHarfAkharChallenge,
    saveNewAdditionalWordsBuildedInHarfAkharChallenge,
    saveNewHiddenWordsBuildedInHarfAkharChallenge,
    saveUnknownWordCompletedInHarfAkharChallenge
} from '../../../../realm/repositories/user/user-harf-akhar-progress.repository';
import { harfAkharChallengeTimeIsOverInConnectingLetters, unknownWordCompletedInHarfAkharChallenge } from '../../../../components/connecting-letters/functions/HarfAkharFunctions';

function ConnectingLettersHarfAkhar(props){
    useConnectingLetterStageGameMusic()
    const colors = useAppTheme()
    const realm = useRealm();
    const challengeId = props?.route?.params?.challengeId
    const partIndex = props?.route?.params?.partIndex
    const wordId = props?.route?.params?.wordId

    const challengeData = useMemo(
        () => getHarfAkharChallengeById(realm, challengeId),
        [realm, challengeId]
    );
    const timeLimitData = challengeData?.time_limit?{
        time_limit: challengeData?.time_limit,
        remaining_time_seconds: challengeData?.remaining_time_seconds,
        remaining_synced_at: challengeData?.remaining_synced_at
    }:undefined
    const partWords = challengeData?.parts[partIndex]?.words
    const wordIndex = partWords?.findIndex(w=>w._id.toString() == wordId)
    const data =  partWords[wordIndex]

    const saveMainWordBuilded = ()=>{
        saveMainWordBuildedInHarfAkharChallenge( realm, challengeId, partIndex, wordId );
    }
    const saveNewAdditionalWordsBuilded = (word)=>{
        saveNewAdditionalWordsBuildedInHarfAkharChallenge( realm, challengeId, partIndex, wordId, word );
    }
    const saveNewHiddenWordsBuilded = (word)=>{
        saveNewHiddenWordsBuildedInHarfAkharChallenge( realm, challengeId, partIndex, wordId, word );
    }
    const completedOperation = ()=>{
        saveUnknownWordCompletedInHarfAkharChallenge( realm, challengeId, partIndex, wordId );
        setTimeout(async()=>{
            unknownWordCompletedInHarfAkharChallenge()
        }, 1500)
    }
    const saveUserHelpRequests = (newLettersHelpUsed)=>{
        null
    }
    const gameTimeIsOver = useCallback(()=>{
        harfAkharChallengeTimeIsOverInConnectingLetters()
    }, [])
    
    return(
        <SafeAreaView style={{flex:1, backgroundColor:"#000000"}}>
            <NightSky>
                <View style={styles.container}>
                    <ConnectingLetters
                        type={"harf-akhar"}
                        data={data}
                        timeLimitData={timeLimitData}
                        stageNumber={undefined}
                        saveMainWordBuilded={saveMainWordBuilded}
                        saveNewAdditionalWordsBuilded={saveNewAdditionalWordsBuilded}
                        saveNewHiddenWordsBuilded={saveNewHiddenWordsBuilded}
                        completedOperation={completedOperation}
                        saveUserHelpRequests={saveUserHelpRequests}
                        gameTimeIsOver={gameTimeIsOver}
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
export default ConnectingLettersHarfAkhar;