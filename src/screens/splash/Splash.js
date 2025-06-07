import React, { useEffect } from 'react';
import { View, Text, Dimensions} from 'react-native';
import { connect } from 'react-redux';
import {useTheme} from '@react-navigation/native';
import {loginOperation, hideSplash, changeTheme} from "../../redux/actions/MainAction";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {DotIndicator} from 'react-native-indicators';
import Font from '../../utils/Font';
import LinearGradient from 'react-native-linear-gradient';
import Globals from '../../utils/Globals';

const {width, height} = Dimensions.get('window')
function Splash(props){
    const colors = useTheme().colors;
    

    const BootStrapAsync = async ()=>{
        try {
            const logined = await AsyncStorage.getItem('logined')
            const theme = await AsyncStorage.getItem('theme')
            if(theme){
                props.changeTheme(theme)
            }
            if(logined && logined == "1"){
                props.loginOperation(true)
                props.hideSplash()
            } else {
                props.hideSplash()
            }
        } catch(e) {
            null
        }
    }
    useEffect(()=>{
        BootStrapAsync()
    }, [])

    return(
        <LinearGradient colors={Globals.data.configs.themes[props.theme].colors.background_gradient} style={{flex:1}}>
            
        </LinearGradient>
    )
}
const mapStateToProps=state=>{
    return{
        showSplash: state.main.showSplash,
        theme: state.main.theme,
        configed: state.main.configed
    }
}
const mapDispatchToProps = (dispatch) => {
    return {
        loginOperation: (data) => dispatch(loginOperation(data)),
        hideSplash: () => dispatch(hideSplash()),
        changeTheme: (data) => dispatch(changeTheme(data)),
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Splash)