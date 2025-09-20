import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import useAppTheme from '../../../hooks/theme/useAppTheme';

const {width, height} = Dimensions.get("window")
function OnlineGame(props){
    const colors = useAppTheme()
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)

    useEffect(()=>{
        getData()
    }, [])
    const getData = async()=>{
        
    }
    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }
    
    return(
        <View style={[styles.container, {backgroundColor:colors.background.a1}]}>

        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});
export default OnlineGame;