import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, View, Text, SafeAreaView, Dimensions} from 'react-native';
import WordToSlot from '../../../../components/word-to-slot/WordToSlot';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import { useDispatch } from 'react-redux';
import GalaxyTwinkle from '../../../../components/particles/GalaxyTwinkle';
import { useWordToSlotStageGameMusic } from '../../../../utils/sound/MusicFunctions';
import { useObject, useRealm } from '../../../../realm';
import { BSON } from 'realm';
import { saveCompletedPartAndSentenceBuildedInHarfAkhar } from '../../../../realm/repositories/user/user-harf-akhar-progress.repository';
import { endOfAChallengeInHarfAkhar, harfAkharChallengeTimeIsOverInWordToSlot } from '../../../../components/word-to-slot/functions/HarfAkharFunctions';

function WordToSlotHarfAkhar(props){
    useWordToSlotStageGameMusic()
    const colors = useAppTheme()
    const realm = useRealm();
    const dispatch = useDispatch();
    const challengeId = props?.route?.params?.challenge
    const session = props?.route?.params?.session
   
    const objectId = typeof challengeId === 'string' ? new BSON.ObjectId(challengeId) : challengeId;
    const data = useObject("HarfAkharChallenge", objectId)

    const saveWordHelpUsed = ()=>{
        null
    }
    const saveCompletedPartAndSentenceBuilded = (partIndex)=>{
        saveCompletedPartAndSentenceBuildedInHarfAkhar( realm, challengeId, partIndex);
    }
    const endOfAStage = ()=>{
        const sentences = data.parts.map((part) => ({
            sentence: part.sentence_display ?? part.sentence,
            hint: part.sentence_hint,
        }));
        const title = data?.title
        const stageHint = data?.stage_hint
        const rewardCoins = data?.reward_coins
        const rewardSubscription = data?.reward_subscription
        endOfAChallengeInHarfAkhar({dispatch, title, session, challengeId, sentences, stageHint, rewardCoins, rewardSubscription})
    }
    const onPressUnknownWord = useCallback((partIndex, wordId)=>{
        props.navigation.navigate("ConnectingLettersHarfAkhar", {challengeId, partIndex, wordId})
    }, [challengeId, props.navigation])

    const gameTimeIsOver = useCallback(()=>{
        harfAkharChallengeTimeIsOverInWordToSlot()
    }, [])

    return(
        <SafeAreaView style={{flex:1, backgroundColor:"#120426"}}>
            <GalaxyTwinkle >
                <SafeAreaView style={styles.container}>
                    <WordToSlot 
                        id={challengeId}
                        type={"harf-akhar"}
                        data={data}
                        saveWordHelpUsed={saveWordHelpUsed}
                        saveCompletedPartAndSentenceBuilded={saveCompletedPartAndSentenceBuilded}
                        endOfAStage={endOfAStage}
                        onPressUnknownWord={onPressUnknownWord}
                        gameTimeIsOver={gameTimeIsOver}
                    />
                </SafeAreaView>
            </GalaxyTwinkle>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      direction: "ltr"
    },
});
export default WordToSlotHarfAkhar;