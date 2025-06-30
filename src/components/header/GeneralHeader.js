import React from "react";
import {StyleSheet, View, Text, Dimensions, TouchableNativeFeedback} from 'react-native';
import Icon from "../../utils/Icon";
import {useTheme} from '@react-navigation/native';
import Font from "../../utils/Font";
import { goBack } from "../../main/navigationService";

const {width} = Dimensions.get('window');
function GeneralHeader({height, hideShadow, paddingHorizontal, rightComponent, leftComponent, back, backIconSize, title, titleFontFamily, titleFontSize, description, descriptionFontFamily, descriptionFontSize}){
    const {colors} = useTheme().colors;

    const goBackOnClick = ()=>{
        goBack()
    }
    return(
        <View style={{backgroundColor:colors.header.background, height:height??65, width:width, shadowColor:colors.shadow.a1, elevation:hideShadow?0:5, flexDirection:'row', alignItems:'center', paddingHorizontal:paddingHorizontal??10, justifyContent:'space-between'}}>
            <View style={{height:"100%", flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:10}}>
                {
                    rightComponent?
                    <rightComponent/>
                    :back&&
                    <TouchableNativeFeedback onPress={goBackOnClick} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                        <View pointerEvents='box-only' style={{justifyContent:'center', alignItems:'center', padding:5}}>
                            <Icon name={"arrow-right"} type='Feather' style={{color:colors.header.content_1, fontSize:backIconSize??30}}/>
                        </View>
                    </TouchableNativeFeedback>
                }
                {
                    title&&
                    <View style={{flexDirection:'column', alignItems:'flex-start', justifyContent:'center'}}>
                        <Text numberOfLines={1} style={{color:colors.header.content_1, maxWidth:width-100, fontFamily:titleFontFamily??Font.medium, fontSize:titleFontSize??16}}>{title}</Text>
                        {
                            description&&
                            <Text numberOfLines={1} style={{color:colors.header.content_2, maxWidth:width-100, fontFamily:descriptionFontFamily??Font.medium, fontSize:descriptionFontSize??12}}>{description}</Text>
                        }
                    </View>
                }
            </View>
            <View style={{height:"100%", flexDirection:'row', alignItems:'center'}}>
                {
                    leftComponent&&
                    <leftComponent/>
                }
            </View>
        </View>
    )
}
export default GeneralHeader;
