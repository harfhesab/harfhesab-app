import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, SafeAreaView, Dimensions} from 'react-native';
import WordToSlot from '../../../../components/word-to-slot/WordToSlot';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import NightSky from '../../../../components/particles/NightSky';

const {width, height} = Dimensions.get("window")
function WordToSlotStageGame(props){
    const colors = useAppTheme()
   
    
    return(
        <SafeAreaView style={{flex:1}}>
            <NightSky>
                <SafeAreaView style={styles.container}>
                    <WordToSlot />
                </SafeAreaView>
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
export default WordToSlotStageGame;