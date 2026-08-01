import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, SafeAreaView, Dimensions} from 'react-native';
import WordToSlot from '../../../../components/word-to-slot/WordToSlot';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import { useSelector } from 'react-redux';
import GalaxyTwinkle from '../../../../components/particles/GalaxyTwinkle';
import { useWordToSlotStageGameMusic } from '../../../../utils/sound/MusicFunctions';
import { useObject } from '../../../../realm';
import { BSON } from 'realm';

function WordToSlotKalamAkhar(props){
    useWordToSlotStageGameMusic()
    const colors = useAppTheme()
    const stageId = props?.route?.params?.stage
   
    const objectId = typeof stageId === 'string' ? new BSON.ObjectId(stageId) : stageId;
    const data = useObject("KalamAkharChallenge", objectId)

    const saveWordHelpUsed = (partIndex, wordId)=>{
        // saveWordHelpUsedInPackageGame( realm, stageId, partIndex, wordId);
    }
    const saveCompletedPartAndSentenceBuilded = (partIndex)=>{
        // saveCompletedPartAndSentenceBuildedInPackageGame( realm, stageId, partIndex);
    }
    const endOfAStage = ()=>{
        // const currentStageId = lastStage
        // const stageNumber = data.stage_number_in_package;
        // const sentences = data.parts.map((part) => ({
        //     sentence: part.sentence_display ?? part.sentence,
        //     hint: part.sentence_hint,
        // }));
        // const stageHint = data?.stage_hint
        // endOfAStageInPackageGame({ realm, packageRef, userPackage, packageName, stageId, currentStageId, stageNumber, sentences, stageHint})
    }

    return(
        <SafeAreaView style={{flex:1, backgroundColor:"#120426"}}>
            <GalaxyTwinkle >
                <SafeAreaView style={styles.container}>
                    <WordToSlot 
                        id={stageId}
                        type={"kalam-akhar"}
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
export default WordToSlotKalamAkhar;