import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity} from 'react-native';
import {useTheme} from '@react-navigation/native';

const {width, height} = Dimensions.get("window")
function OnlineGame(props){
    const {colors} = useTheme().colors;
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
        <View>

        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
    linearGradient: {
        flex: 1,
    },
});
export default OnlineGame;