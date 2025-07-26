import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, SafeAreaView, Dimensions} from 'react-native';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import LetterToWord from '../../../../components/connecting-letters/LetterToWord';

const {width, height} = Dimensions.get("window")
function ConnectingLetters(props){
    const colors = useAppTheme()
   
    
    return(
        <SafeAreaView style={styles.container}>
            <LetterToWord />
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      direction: "ltr"
    },
});
export default ConnectingLetters;