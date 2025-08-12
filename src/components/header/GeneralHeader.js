import React from "react";
import {StyleSheet, View, Text, Dimensions, TouchableNativeFeedback} from 'react-native';
import Icon from "../../utils/Icon";
import Font from "../../utils/Font";
import { goBack } from "../../main/navigationService";
import useAppTheme from "../../hooks/theme/useAppTheme";

const {width} = Dimensions.get('window');
function GeneralHeader({height, hideShadow, paddingHorizontal, RightComponent, LeftComponent, back, backIconSize, title, titleFontFamily, titleFontSize, description, descriptionFontFamily, descriptionFontSize}){
    const colors = useAppTheme();

    const goBackOnClick = ()=>{
        goBack()
    }
    return(
        <View style={{backgroundColor:colors.header.background, height:height??65, width:width, shadowColor:colors.shadow.a2, elevation:hideShadow?0:5, flexDirection:'row', alignItems:'center', paddingHorizontal:paddingHorizontal??10, justifyContent:'space-between', zIndex:100}}>
            <View style={{height:"100%", flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:5}}>
                {
                    RightComponent?
                    <RightComponent/>
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
                        <Text numberOfLines={1} style={{color:colors.header.content_1, maxWidth:width-100, fontFamily:titleFontFamily??Font.medium, fontSize:titleFontSize??14}}>{title}</Text>
                        {
                            description&&
                            <Text numberOfLines={1} style={{color:colors.header.content_2, maxWidth:width-100, fontFamily:descriptionFontFamily??Font.medium, fontSize:descriptionFontSize??12}}>{description}</Text>
                        }
                    </View>
                }
            </View>
            <View style={{height:"100%", flexDirection:'row', alignItems:'center'}}>
                {
                    LeftComponent&&
                    <LeftComponent/>
                }
            </View>
        </View>
    )
}
export default GeneralHeader;
