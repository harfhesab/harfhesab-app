import React, {memo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Font from '../utils/Font';
import { DotIndicator, UIActivityIndicator } from 'react-native-indicators';
import LinearGradient from 'react-native-linear-gradient';

function ButtonGradient({loading, loadingType, loadingContent, onPress, borderRadius, width, height, text, text2, icon, complateContent, backgorundGradinte, textSize, fontFamily, justifyContent}){
    const {colors} = useTheme().colors;

    const renderLoading = ()=>(
        <View style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
            {
                loadingContent?
                <loadingContent/>:
                !loadingType?
                <DotIndicator color={colors.button_gradient.content_1} count={3} size={7}/>:
                loadingType == "DotIndicator"?
                <DotIndicator color={colors.button_gradient.content_1} count={3} size={7}/>:
                loadingType == "UIActivityIndicator"&&
                <UIActivityIndicator color={colors.button_gradient.content_1} count={3} size={7}/>
            }
        </View>
    )

    return(
        <TouchableOpacity disabled={loading} activeOpacity={0.7} onPress={onPress} style={{width:width, height:height, alignItems:'center', justifyContent:'center', borderRadius:borderRadius}}>
            <LinearGradient colors={backgorundGradinte??colors.button_gradient.backgorund} style={{borderRadius:borderRadius, width:"100%", height:"100%"}}>
                <View style={{borderRadius:borderRadius, width:"100%", height:"100%", alignItems:'center', justifyContent:'center'}}>
                    {
                        loading == true?
                        (renderLoading())
                        :
                        complateContent?
                        (<complateContent/>)
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