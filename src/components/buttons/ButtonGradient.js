import React, {memo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Font from '../../utils/Font';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '@react-navigation/native';

function ButtonGradient(
    {loading, loadingType, onPress, borderRadius, width, height, text, text2, icon, ComplateContent, backgorundGradinte, textSize, fontFamily, justifyContent, activeOpacity}
){
    const {colors} = useTheme().colors;

    const renderLoading = ()=>(
        <View style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
            {
                !loadingType?
                <DotIndicator color={colors.button_gradient.content_1} count={3} size={7}/>:
                loadingType == "DotIndicator"?
                <DotIndicator color={colors.button_gradient.content_1} count={3} size={7}/>:
                loadingType == "MaterialIndicator"&&
                <MaterialIndicator color={colors.button_gradient.content_1} trackWidth={3} size={25}/>
            }
        </View>
    )

    return(
        <TouchableOpacity disabled={loading} activeOpacity={activeOpacity??0.8} onPress={onPress} style={{width:width, height:height, alignItems:'center', justifyContent:'center', borderRadius:borderRadius??5, shadowColor:colors.shadow.a1, elevation:3}}>
            <LinearGradient colors={backgorundGradinte??colors.button_gradient.background} style={{borderRadius:borderRadius??5, width:"100%", height:"100%"}}>
                <View style={{borderRadius:borderRadius??5, width:"100%", height:"100%", alignItems:'center', justifyContent:'center'}}>
                    {
                        loading == true?
                        (renderLoading())
                        :
                        ComplateContent?
                        (<ComplateContent/>)
                        :
                        icon?
                        (<View style={{flexDirection:'row', alignItems:'center', width:'100%', justifyContent:justifyContent??'space-between', paddingHorizontal:15}}>
                            <Text style={{fontFamily:fontFamily??Font.medium, fontSize:textSize??16, color:colors.button_gradient.content_1, textAlign:'center'}}>{text}</Text>
                            <props.icon/>
                        </View>)
                        :
                        (<View style={{width:'100%', alignItems:'center'}}>
                            <Text style={{fontFamily:fontFamily??Font.medium, fontSize:textSize??16, color:colors.button_gradient.content_1, textAlign:'center'}}>{text}</Text>
                            {
                                text2&&
                                <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.button_gradient.content_2, textAlign:'center'}}>{text2}</Text>
                            }
                        </View>)
                    }
                </View>
            </LinearGradient>
        </TouchableOpacity>
    )
}
export default memo(ButtonGradient);