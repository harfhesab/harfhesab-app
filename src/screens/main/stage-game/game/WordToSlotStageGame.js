import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, SafeAreaView, Dimensions} from 'react-native';
import WordToSlot from '../../../../components/word-to-slot/WordToSlot';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import { useDispatch, useSelector } from 'react-redux';
import GalaxyTwinkle from '../../../../components/particles/GalaxyTwinkle';
import { useWordToSlotStageGameMusic } from '../../../../utils/sound/MusicFunctions';
import { useObject, useRealm } from '../../../../realm';
import { BSON } from 'realm';
import { saveCompletedPartAndSentenceBuildedInStageGame, saveWordHelpUsedInStageGame } from '../../../../realm/repositories/user/user-stage-game-progress.repository';
import { endOfAStageInStageGame } from '../../../../components/word-to-slot/functions/StageGameFunctions';

function WordToSlotStageGame(props){
    useWordToSlotStageGameMusic()
    const dispatch = useDispatch();
    const colors = useAppTheme()
    const realm = useRealm();
    const stageId = props?.route?.params?.stage
    const { lastStage } = useSelector((state) => state.stageGame);
   
    const objectId = typeof stageId === 'string' ? new BSON.ObjectId(stageId) : stageId;
    const data = useObject("Stage", objectId)

    const saveWordHelpUsed = (partIndex, wordId)=>{
        saveWordHelpUsedInStageGame( realm, stageId, partIndex, wordId);
    }
    const saveCompletedPartAndSentenceBuilded = (partIndex)=>{
        saveCompletedPartAndSentenceBuildedInStageGame( realm, stageId, partIndex);
    }
    const endOfAStage = ()=>{
        const language_ref = data?.language_ref?.toHexString()
        const currentStageId = lastStage
        const stageNumber = data.stage_number_in_language;
        const sentences = data.parts.map((part) => ({
            sentence: part.sentence_display ?? part.sentence,
            hint: part.sentence_hint,
        }));
        const stageHint = data?.stage_hint
        endOfAStageInStageGame({dispatch, realm, language_ref, stageId, currentStageId, stageNumber, sentences, stageHint})
    }

    return(
        <SafeAreaView style={{flex:1, backgroundColor:"#120426"}}>
            <GalaxyTwinkle >
                <SafeAreaView style={styles.container}>
                    <WordToSlot 
                        id={stageId}
                        type={"stage-game"}
                        data={data}
                        saveWordHelpUsed={(partIndex, wordId)=>saveWordHelpUsed(partIndex, wordId)}
                        saveCompletedPartAndSentenceBuilded={(partIndex)=>saveCompletedPartAndSentenceBuilded(partIndex)}
                        endOfAStage={endOfAStage}
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
export default WordToSlotStageGame;