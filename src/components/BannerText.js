import React from 'react';
import {View, Text} from 'react-native';
import Font from '../utils/Font';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../utils/Icon';
import useAppTheme from '../hooks/theme/useAppTheme';


function BannerText({iconName, iconType, iconFontSize, iconRepeat, iconEnd, width, height, borderRadius, text1, alignItemsText1, fontFamilyText1, fontSizeText1, textAlignText1, lineHeightText1, text2, alignItemsText2, fontFamilyText2, fontSizeText2, textAlignText2, lineHeightText2}){
    const colors = useAppTheme();

    return(
        <LinearGradient colors={colors.text_banner.background} style={{borderRadius:borderRadius??10, width:width??"100%", height:height??"100%", shadowColor:colors.shadow.a1, elevation:10}}>
            <View style={{borderRadius:borderRadius??10, width:width??"100%", height:height??"100%"}}>
                {
                    (iconName && iconType)&&(
                        <View style={{width:width??"100%", flexDirection:iconEnd == true?'row-reverse':'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:10, paddingTop:10, paddingBottom:5}}>
                            <Icon name={iconName} type={iconType} style={{color:colors.text_banner.content_2, fontSize:iconFontSize??25}}/>
                            {
                                iconRepeat&&(
                                    <Icon name={iconName} type={iconType} style={{color:colors.text_banner.content_2, fontSize:iconFontSize??25}}/>
                                )
                            }
                        </View>
                    )
                }
                <View style={{flex:1, width:width??"100%", alignItems:alignItemsText1??'center', justifyContent:(iconName && iconType)?'flex-start':'center', gap:15, paddingHorizontal:15}}>
                    <Text style={{fontFamily:fontFamilyText1??Font.bold, fontSize:fontSizeText1??17, color:colors.text_banner.content_1, textAlign:textAlignText1??"center", lineHeight:lineHeightText1??30}}>{text1}</Text>
                    {
                        text2&&(
                            <View style={{width:"100%", alignItems:alignItemsText2??'center'}}>
                                <Text style={{fontFamily:fontFamilyText2??Font.medium, fontSize:fontSizeText2??14, color:colors.text_banner.content_2, textAlign:textAlignText2??"center", lineHeight:lineHeightText2??26}}>{text2}</Text>
                            </View>
                        )
                    }
                </View>
            </View>
        </LinearGradient>
    )
}
export default BannerText;