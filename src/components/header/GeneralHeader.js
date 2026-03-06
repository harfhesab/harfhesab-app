import React from "react";
import {StyleSheet, View, Text, Dimensions, TouchableOpacity} from 'react-native';
import Icon from "../../utils/Icon";
import Font from "../../utils/Font";
import { goBack } from "../../main/navigationService";
import useAppTheme from "../../hooks/theme/useAppTheme";
import NumberCoins from "../coin/NumberCoins";
import Back from "../icon/Back";
import SubscriptionInfoBtn from "../buttons/SubscriptionInfoBtn";
import SubscriptionBtn from "../buttons/SubscriptionBtn";
import MyPackageBtn from "../buttons/MyPackageBtn";

const {width} = Dimensions.get('window');
const colors = useAppTheme();
function GeneralHeader({
    height=60,
    hideShadow,
    Image,
    paddingHorizontal = 12,
    RightComponent,
    LeftComponent,
    back,
    myPackage,
    coin,
    subscriptionInfo,
    subscription,
    title,
    titleFontFamily,
    titleFontSize,
    description,
    descriptionFontFamily,
    descriptionFontSize,
    backgroundColor=colors.header.background,
    shadowColor=colors.shadow.a2,
    borderBottomColor=colors.border.a2,
    borderBottomWidth=0.5
}){
    

    const goBackOnClick = ()=>{
        goBack()
    }

    return(
        <View style={{backgroundColor:backgroundColor, height:height, width:width, shadowColor:shadowColor, elevation:hideShadow?0:5, flexDirection:'row', alignItems:'center', paddingHorizontal:paddingHorizontal, justifyContent:'space-between', zIndex:100, borderBottomColor:borderBottomColor, borderBottomWidth:borderBottomWidth}}>
            
            {/* این کانتینر اصلی برای بخش راست و وسط است */}
            {/* 1. این ویو را "انعطاف‌پذیر" می‌کنیم تا فضای خالی را پر کند */}
            <View style={{flex: 1, height:"100%", flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:10, overflow: 'hidden'}}>
                {
                    RightComponent?
                    <RightComponent/>
                    :back&&
                    <Back/>
                }
                {
                    myPackage&&
                    <MyPackageBtn/>
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
            <View style={{height:"100%", flexDirection:'row', alignItems:'center', gap:10}}>
                {
                    LeftComponent&&
                    <LeftComponent/>
                }
                {
                    coin&&
                    <NumberCoins />
                }
                {
                    subscriptionInfo&&
                    <SubscriptionInfoBtn />
                }
                {
                    subscription&&
                    <SubscriptionBtn />
                }
            </View>
        </View>
    )
}

export default GeneralHeader;