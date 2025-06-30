import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView} from 'react-native';
import {useTheme} from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootReducer';
import { login, logout } from '../../../redux/slices/authSlice';
import LinearGradient from 'react-native-linear-gradient';

const {width, height} = Dimensions.get("window")
function Account(props){
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
        <SafeAreaView>
            <LinearGradient colors={colors.background_gradient} style={{width:width, height:height}}>
                <View style={styles.container}>

                </View>
            </LinearGradient>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});

export default Account;