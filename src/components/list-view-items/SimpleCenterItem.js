import React, {memo} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../utils/Globals';
import useAppTheme from '../../hooks/theme/useAppTheme';

const width = Dimensions.get('window').width
function SimpleCenterItem({ onPress, disabled, width, height, paddingHorizontal, text1, fontFamilyText1, fontSizeText1, colorText1}){
    const colors = useAppTheme();

    const onClick = () => {
        if (disabled) return;
        onPress();
    };

    return (
        <TouchableNativeFeedback disabled={disabled??undefined} onPress={onClick} style={{width:width??"100%"}} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
            <View style={{alignItems:'center', justifyContent:'center', width:width??"100%", height:height??60, paddingHorizontal:paddingHorizontal??15}}>
                <Text style={{fontFamily:fontFamilyText1??Font.medium, color:colorText1??colors.text.a1, fontSize:fontSizeText1??14}}>{text1}</Text>
            </View>
        </TouchableNativeFeedback> 
    );
};
export default memo(SimpleCenterItem)