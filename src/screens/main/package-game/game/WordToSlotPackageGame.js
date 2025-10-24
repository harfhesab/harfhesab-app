import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, SafeAreaView, Dimensions} from 'react-native';
import WordToSlot from '../../../../components/word-to-slot/WordToSlot';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import GalaxyTwinkle from '../../../../components/particles/GalaxyTwinkle';

function WordToSlotPackageGame(props){
    const colors = useAppTheme()
    const stage = props?.route?.params?.stage;
    const lastStage = props?.route?.params?.lastStage;
    const packageRef = props?.route?.params?.packageRef;
    const userPackage = props?.route?.params?.userPackage;
    const packageName = props?.route?.params?.packageName;
   
    
    return(
        <SafeAreaView style={{flex:1, backgroundColor:"#120426"}}>
            <GalaxyTwinkle >
                <SafeAreaView style={styles.container}>
                    <WordToSlot 
                        id={stage}
                        currentStageId={lastStage}
                        type={"package-game"}
                        packageRef={packageRef}
                        userPackage={userPackage}
                        packageName={packageName}
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