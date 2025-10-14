import React, {memo} from "react";
import {StyleSheet, View, Text, Dimensions, TouchableNativeFeedback, TouchableOpacity} from 'react-native';
import Icon from "../../utils/Icon";
import Font from "../../utils/Font";
import useAppTheme from "../../hooks/theme/useAppTheme";
import NumberCoins from "../coin/NumberCoins";
import Back from "../icon/Back";
import Setting from "../icon/Setting";

const {width} = Dimensions.get('window');
function SeasonHeader({height=65, paddingHorizontal=10, back=true, coin=true, title, setting=true}){
    const colors = useAppTheme();
    return(
        <View style={{height:height, width:width, flexDirection:'row', alignItems:'center', paddingHorizontal:paddingHorizontal, justifyContent:'space-between', zIndex:1000}}>
            <View style={{height:"100%", flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:10}}>
                {
                    back&&
                    <Back/>
                    
                }
                {
                    title&&
                    <View style={{flexDirection:'column', alignItems:'flex-start', justifyContent:'center'}}>
                        <Text numberOfLines={1} style={{color:colors.header.content_1, maxWidth:width-100, fontFamily:Font.medium, fontSize:14}}>{title}</Text>
                    </View>
                }
            </View>
            <View style={{height:"100%", flexDirection:'row', alignItems:'center', gap:7}}>
                {
                    coin&&
                    <NumberCoins/>
                }
                {
                    setting&&
                    <Setting/>
                }
            </View>
        </View>
    )
}

export default memo(SeasonHeader);
