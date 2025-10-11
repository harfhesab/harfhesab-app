import React from "react";
import {StyleSheet, View, Text, Dimensions, TouchableOpacity} from 'react-native';
import Icon from "../../utils/Icon";
import Font from "../../utils/Font";
import { goBack } from "../../main/navigationService";
import useAppTheme from "../../hooks/theme/useAppTheme";
import NumberCoins from "../coin/NumberCoins";

const {width} = Dimensions.get('window');

function GeneralHeader({height, hideShadow, Image, paddingHorizontal, RightComponent, LeftComponent, back, coin, title, titleFontFamily, titleFontSize, description, descriptionFontFamily, descriptionFontSize}){
    const colors = useAppTheme();

    const goBackOnClick = ()=>{
        goBack()
    }

    return(
        <View style={{backgroundColor:colors.header.background, height:height??65, width:width, shadowColor:colors.shadow.a2, elevation:hideShadow?0:5, flexDirection:'row', alignItems:'center', paddingHorizontal:paddingHorizontal??15, justifyContent:'space-between', zIndex:100, borderBottomColor:colors.border.a2, borderBottomWidth:0.5}}>
            
            {/* این کانتینر اصلی برای بخش راست و وسط است */}
            {/* 1. این ویو را "انعطاف‌پذیر" می‌کنیم تا فضای خالی را پر کند */}
            <View style={{flex: 1, height:"100%", flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:10, overflow: 'hidden'}}>
                {
                    RightComponent?
                    <RightComponent/>
                    :back&&
                    <TouchableOpacity onPress={goBackOnClick} activeOpacity={0.8}>
                        <View style={{justifyContent:'center', alignItems:'center', height:40, width:40, borderWidth:1, borderRadius:8, borderColor:colors.border.a1, backgroundColor:`${colors.primary.a1}25`}}>
                            <Icon name={"arrow-right"} type='Feather' style={{color:colors.text.a1, fontSize:25}}/>
                        </View>
                    </TouchableOpacity>
                }
                {
                    Image&&
                    <Image/>
                }
                {
                    title&&
                    // 2. این ویو را هم "انعطاف‌پذیر" می‌کنیم تا در فضای باقی‌مانده‌ی والدش کش بیاید
                    <View style={{flex: 1, flexDirection:'column', alignItems:'flex-start', justifyContent:'center'}}>
                        <Text numberOfLines={1} style={{color:colors.header.content_1, fontFamily:titleFontFamily??Font.medium, fontSize:titleFontSize??14}}>{title}</Text>
                        {
                            description&&
                            <Text numberOfLines={1} style={{color:colors.header.content_2, fontFamily:descriptionFontFamily??Font.medium, fontSize:descriptionFontSize??10}}>{description}</Text>
                        }
                    </View>
                }
            </View>
            
            {/* این کانتینر برای بخش چپ است */}
            <View style={{height:"100%", flexDirection:'row', alignItems:'center'}}>
                {
                    LeftComponent&&
                    <LeftComponent/>
                }
                {
                    coin&&
                    <NumberCoins />
                }
            </View>
        </View>
    )
}

export default GeneralHeader;