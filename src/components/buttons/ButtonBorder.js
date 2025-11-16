import React, {memo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Font from '../../utils/Font';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import useAppTheme from '../../hooks/theme/useAppTheme';

const colors = useAppTheme();
function ButtonBorder(
    {
        loading,
        loadingType,
        onPress,
        borderRadius=5,
        borderWidth=0.75,
        borderColor = colors.primary.a1,
        width,
        height,
        text,
        text2,
        iconName,
        iconType,
        iconSize=25,
        complateContent,
        textSize=16,
        fontFamily=Font.medium,
        justifyContent='center',
        flexDirection="row",
        activeOpacity=0.8,
        textColor=colors.primary.a1,
    }
){

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
        <TouchableOpacity disabled={loading} activeOpacity={activeOpacity} onPress={onPress} style={{width:width, height:height, alignItems:'center', justifyContent:'center', borderRadius:borderRadius}}>
            <View style={{borderRadius:borderRadius, borderWidth:borderWidth, borderColor:borderColor, width:"100%", height:"100%", alignItems:'center', justifyContent:'center', backgroundColor:borderColor?`${borderColor}15`:`${colors.primary.a1}25`}}>
                {
                    (loading == true)?
                    (renderLoading())
                    :
                    complateContent?
                    (<complateContent/>)
                    :
                    (iconName && iconType)?
                    (<View style={{flexDirection:flexDirection, alignItems:'center', width:'100%', justifyContent:justifyContent, paddingHorizontal:15, gap:15}}>
                        <Text style={{fontFamily:fontFamily, fontSize:textSize, color:textColor}}>{text}</Text>
                        <Icon name={iconName} type={iconType} style={{fontSize:iconSize, color:textColor}}/>
                    </View>)
                    :
                    (<View style={{width:'100%', alignItems:'center'}}>
                        <Text style={{fontFamily:fontFamily, fontSize:textSize, color:textColor, textAlign:'center'}}>{text}</Text>
                        {
                            text2&&
                            <Text style={{fontFamily:Font.medium, fontSize:12, color:textColor, textAlign:'center'}}>{text2}</Text>
                        }
                    </View>)
                }
            </View>
        </TouchableOpacity>
    )
}
export default memo(ButtonBorder);