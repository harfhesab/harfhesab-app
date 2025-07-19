import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, SafeAreaView, Dimensions} from 'react-native';
import {useTheme} from '@react-navigation/native';
import WordToSlot from '../../../../components/word-to-slot/WordToSlot';

const {width, height} = Dimensions.get("window")
function WordToSlotStageGame(props){
    const {colors} = useTheme().colors;
   
    
    return(
        <SafeAreaView style={styles.container}>
            <WordToSlot />
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