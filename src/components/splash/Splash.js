import React, { useEffect } from 'react';
import { View, Text, Dimensions} from 'react-native';
import {loginOperation, hideSplash, changeTheme} from "../../redux/actions/MainAction";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {DotIndicator} from 'react-native-indicators';
import Font from '../../utils/Font';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import Color from '../../utils/Color';

const {width, height} = Dimensions.get('window')
function Splash(props){
    const { theme } = useSelector((state) => state.ui);

    return(
        <LinearGradient colors={Color.themes[theme].colors.background_gradient} style={{flex:1}}>
            <Text>{"در حال بارگذاری"}</Text>
        </LinearGradient>
    )
}
export default Splash;