import React, { memo } from "react";
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
import NotificationBtn from "../buttons/NotificationBtn";
import Home from "../icon/Home";

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
    home,
    notification,
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

    return(
        <View style={{backgroundColor:backgroundColor, height:height, width:width, shadowColor:shadowColor, elevation:hideShadow?0:5, flexDirection:'row', alignItems:'center', paddingHorizontal:paddingHorizontal, justifyContent:'space-between', zIndex:100, borderBottomColor:borderBottomColor, borderBottomWidth:borderBottomWidth}}>
            <View style={{flex: 1, height:"100%", flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:10, overflow: 'hidden'}}>
                {
                    RightComponent?
                    <RightComponent/>
                    :back&&
                    <Back/>
                }
                {
                    home?.length > 0&&
                    <Home
                        route={home}
                    />
                }
                {
                    notification&&
                    <NotificationBtn/>
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
                    <View style={{flex: 1, flexDirection:'column', alignItems:'flex-start', justifyContent:'center'}}>
                        <Text numberOfLines={1} style={{color:colors.header.content_1, fontFamily:titleFontFamily??Font.bakh_semi_bold, fontSize:titleFontSize??14}}>{title}</Text>
                        {
                            description&&
                            <Text numberOfLines={1} style={{color:colors.header.content_2, fontFamily:descriptionFontFamily??Font.bakh_semi_bold, fontSize:descriptionFontSize??10}}>{description}</Text>
                        }
                    </View>
                }
            </View>
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

export default memo(GeneralHeader);