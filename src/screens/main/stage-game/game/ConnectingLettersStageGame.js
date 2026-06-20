import React from 'react';
import {StyleSheet, View, Text, SafeAreaView} from 'react-native';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import ConnectingLetters from '../../../../components/connecting-letters/ConnectingLetters';
import NightSky from '../../../../components/particles/NightSky';
import { useConnectingLetterStageGameMusic } from '../../../../utils/sound/MusicFunctions';

function ConnectingLettersStageGame(props){
    useConnectingLetterStageGameMusic()
    const colors = useAppTheme()
    const stageId = props?.route?.params?.stageId
    const partIndex = props?.route?.params?.partIndex
    const wordId = props?.route?.params?.wordId
    
    return(
        <SafeAreaView style={{flex:1, backgroundColor:"#000000"}}>
            <NightSky>
                <View style={styles.container}>
                    <ConnectingLetters 
                        type={"stage-game"}
                        stageId={stageId}
                        partIndex={partIndex}
                        wordId={wordId}
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
export default ConnectingLettersStageGame;