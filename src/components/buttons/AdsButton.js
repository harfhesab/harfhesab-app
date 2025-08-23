import React, {memo} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import Font from '../../utils/Font';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import useAppTheme from '../../hooks/theme/useAppTheme';
import LinearGradient from 'react-native-linear-gradient';

function AdsButton(
    { onPress, width=160, height=55, fontSize=16, fontFamily=Font.medium, textColor="#FFFFFF", backgorundGradinte=['#bf360c', '#ff6900'], borderRadius=10}
){
    const colors = useAppTheme();
    return(
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{width:width, height:height, alignItems:'center', justifyContent:'center', borderRadius:borderRadius??5}}>
            <LinearGradient colors={backgorundGradinte} style={{borderRadius, width:"100%", height:"100%"}}>
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', gap:15, height:"100%", paddingHorizontal:10}}>
                    <Text style={{fontSize, fontFamily, color:textColor}}>{"مشاهدهٔ تبلیغ"}</Text>
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', gap:2}}>
                        <Text style={{fontSize, fontFamily, color:textColor}}>{"10+"}</Text>
                        <Image
                            style={{width:fontSize*1.5, height:fontSize*1.5}}
                            source={require('../../assets/image/coin.png')}
                        />
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}
export default memo(AdsButton);