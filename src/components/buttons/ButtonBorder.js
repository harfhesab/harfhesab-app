import React, {memo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Font from '../../utils/Font';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import {useTheme} from '@react-navigation/native';

function ButtonBorder(
    {loading, loadingType, onPress, borderRadius, borderWidth, borderColor, width, height, text, text2, iconName, iconType, iconSize, complateContent, textSize, fontFamily, justifyContent, flexDirection, activeOpacity}
){
    const {colors} = useTheme().colors;

    const renderLoading = ()=>(
        <View style={{width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
            {
                !loadingType?
                <DotIndicator color={borderColor??colors.primary.a1} count={3} size={7}/>:
                loadingType == "DotIndicator"?
                <DotIndicator color={borderColor??colors.primary.a1} count={3} size={7}/>:
                loadingType == "MaterialIndicator"&&
                <MaterialIndicator color={borderColor??colors.primary.a1} trackWidth={3} size={25}/>
            }
        </View>
    )

    return(
        <TouchableOpacity disabled={loading} activeOpacity={activeOpacity??0.8} onPress={onPress} style={{width:width, height:height, alignItems:'center', justifyContent:'center', borderRadius:borderRadius??5}}>
            <View style={{borderRadius:borderRadius??5, borderWidth:borderWidth??1.5, borderColor:borderColor??colors.primary.a1, width:"100%", height:"100%", alignItems:'center', justifyContent:'center'}}>
                {
                    (loading == true)?
                    (renderLoading())
                    :
                    complateContent?
                    (<complateContent/>)
                    :
                    (iconName && iconType)?
                    (<View style={{flexDirection:flexDirection??'row', alignItems:'center', width:'100%', justifyContent:justifyContent??'center', paddingHorizontal:15, gap:15}}>
                        <Text style={{fontFamily:fontFamily??Font.medium, fontSize:textSize??16, color:borderColor??colors.primary.a1}}>{text}</Text>
                        <Icon name={iconName} type={iconType} style={{fontSize:iconSize??25, color:borderColor??colors.primary.a1}}/>
                    </View>)
                    :
                    (<View style={{width:'100%', alignItems:'center'}}>
                        <Text style={{fontFamily:fontFamily??Font.medium, fontSize:textSize??16, color:borderColor??colors.primary.a1, textAlign:'center'}}>{text}</Text>
                        {
                            text2&&
                            <Text style={{fontFamily:Font.medium, fontSize:12, color:borderColor??colors.primary.a1, textAlign:'center'}}>{text2}</Text>
                        }
                    </View>)
                }
            </View>
        </TouchableOpacity>
    )
}
export default memo(ButtonBorder);