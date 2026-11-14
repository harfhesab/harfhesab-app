import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, View, Text, SafeAreaView, Dimensions} from 'react-native';
import WordToSlot from '../../../../components/word-to-slot/WordToSlot';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import GalaxyTwinkle from '../../../../components/particles/GalaxyTwinkle';
import { useWordToSlotPackageGameMusic } from '../../../../utils/sound/MusicFunctions';
import { useObject, useRealm } from '../../../../realm';
import { BSON } from 'realm';
import { saveCompletedPartAndSentenceBuildedInPackageGame, saveWordHelpUsedInPackageGame } from '../../../../realm/repositories/user/user-package-game-progress.repository';
import { endOfAStageInPackageGame } from '../../../../components/word-to-slot/functions/PackageGameFunctions';

function WordToSlotPackageGame(props){
    useWordToSlotPackageGameMusic()
    const colors = useAppTheme()
    const realm = useRealm();
    const stageId = props?.route?.params?.stage;
    const lastStage = props?.route?.params?.lastStage;
    const packageRef = props?.route?.params?.packageRef;
    const userPackage = props?.route?.params?.userPackage;
    const packageName = props?.route?.params?.packageName;
   
    const objectId = typeof stageId === 'string' ? new BSON.ObjectId(stageId) : stageId;
    const data = useObject("PackageStage", objectId)

    const saveWordHelpUsed = (partIndex, wordId)=>{
        saveWordHelpUsedInPackageGame( realm, stageId, partIndex, wordId);
    };

    const saveCompletedPartAndSentenceBuilded = (partIndex)=>{
        saveCompletedPartAndSentenceBuildedInPackageGame( realm, stageId, partIndex);
    };

    const endOfAStage = ()=>{
        const currentStageId = lastStage
        const stageNumber = data.stage_number_in_package;
        const sentences = data.parts.map((part) => ({
            sentence: part.sentence_display ?? part.sentence,
            hint: part.sentence_hint,
        }));
        const stageHint = data?.stage_hint
        endOfAStageInPackageGame({ realm, packageRef, userPackage, packageName, stageId, currentStageId, stageNumber, sentences, stageHint})
    };

    const onPressUnknownWord = useCallback((partIndex, wordId)=>{
        props.navigation.navigate("ConnectingLettersPackageGame", {stageId, partIndex, wordId})
    }, [stageId, props.navigation])
    
    return(
        <SafeAreaView style={{flex:1, backgroundColor:"#120426"}}>
            <GalaxyTwinkle >
                <SafeAreaView style={styles.container}>
                    <WordToSlot 
                        id={stageId}
                        type={"package-game"}
                        data={data}
                        saveWordHelpUsed={saveWordHelpUsed}
                        saveCompletedPartAndSentenceBuilded={saveCompletedPartAndSentenceBuilded}
                        endOfAStage={endOfAStage}
                        onPressUnknownWord={onPressUnknownWord}
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
export default WordToSlotPackageGame;