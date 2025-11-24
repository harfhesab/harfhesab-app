import React, {memo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Font from '../../utils/Font';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../utils/Icon';
import useAppTheme from '../../hooks/theme/useAppTheme';

function ButtonGradient(
    {loading, loadingType, onPress, borderRadius=8, width, height, text, text2, iconName, iconType, iconSize=25, backgorundGradinte, textSize=16, fontFamily=Font.medium, justifyContent='center', flexDirection='row', activeOpacity=0.8}
){
    const colors = useAppTheme();

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
        <TouchableOpacity disabled={loading} activeOpacity={activeOpacity} onPress={onPress} style={{width:width, height:height, alignItems:'center', justifyContent:'center', borderRadius:borderRadius, shadowColor:colors.shadow.a1, elevation:3}}>
            <LinearGradient colors={backgorundGradinte??colors.button_gradient.background} style={{borderRadius:borderRadius, width:"100%", height:"100%"}}>
                <View style={{borderRadius:borderRadius, width:"100%", height:"100%", alignItems:'center', justifyContent:'center'}}>
                    {
                        (loading == true)?
                        (renderLoading())
                        :
                        (iconName && iconType)?
                        (<View style={{flexDirection:flexDirection, alignItems:'center', width:'100%', justifyContent:justifyContent, paddingHorizontal:15, gap:15}}>
                            {text&&<Text style={{fontFamily:fontFamily, fontSize:textSize, color:colors.button_gradient.content_1}}>{text}</Text>}
                            <Icon name={iconName} type={iconType} style={{fontSize:iconSize, color:colors.button_gradient.content_1}}/>
                        </View>)
                        :
                        (<View style={{width:'100%', alignItems:'center'}}>
                            <Text style={{fontFamily:fontFamily, fontSize:textSize, color:colors.button_gradient.content_1, textAlign:'center'}}>{text}</Text>
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