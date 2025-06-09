import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity} from 'react-native';
import {useTheme} from '@react-navigation/native';
import { getRealm } from '../../../realm';

const {width, height} = Dimensions.get("window")
function StageGame(props){
    const {colors} = useTheme().colors;
    const [loading, setLoading] = useState(true)
    const [getError, setGetError] = useState(false)

    useEffect(() => {
        console.log("000000000000000")
        getData()
    }, []);
    const getData = async ()=>{
        const realm = await getRealm();
        console.log("111111111111111", realm)
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
export default StageGame;