import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, SafeAreaView, Dimensions} from 'react-native';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import ConnectingLetters from '../../../../components/connecting-letters/ConnectingLetters';
import NightSky from '../../../../components/particles/NightSky';

const {width, height} = Dimensions.get("window")
function ConnectingLettersStageGame(props){
    const colors = useAppTheme()
    const data = {
        word : "کوی",
        letters : ["ک", "و", "ی", "ب", "ل", "س"],
        additional_words : ["بوس", "بیل", "سیب"],
        hidden_words : ["سیل", "کولی"]
    }
   
    
    return(
        <NightSky>
            <SafeAreaView style={styles.container}>
                <ConnectingLetters />
            </SafeAreaView>
        </NightSky>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      direction: "ltr"
    },
});
export default ConnectingLettersStageGame;