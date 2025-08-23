import React, {memo} from "react";
import {StyleSheet, View, Text, Dimensions, TouchableNativeFeedback, TouchableOpacity} from 'react-native';
import Icon from "../../utils/Icon";
import Font from "../../utils/Font";
import { goBack } from "../../main/navigationService";
import useAppTheme from "../../hooks/theme/useAppTheme";
import NumberCoins from "../coin/NumberCoins";

const {width} = Dimensions.get('window');
function SeasonHeader({height=65, paddingHorizontal=15, back=true, coin=true, title, setting=true, transparent=0}){
    const colors = useAppTheme();

    const goBackOnClick = ()=>{
        goBack()
    }
    return(
        <View style={{backgroundColor:`rgba(14,32,42,${transparent})`, height:height, width:width, shadowColor:colors.shadow.a2, elevation:transparent < 0.85?0:5, flexDirection:'row', alignItems:'center', paddingHorizontal:paddingHorizontal, justifyContent:'space-between', zIndex:1000}}>
            <View style={{height:"100%", flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:10}}>
                {
                    back&&
                    <TouchableOpacity onPress={goBackOnClick} activeOpacity={0.8}>
                        <View style={{justifyContent:'center', alignItems:'center', height:40, width:40, borderWidth:1, borderRadius:8, borderColor:colors.border.a1, backgroundColor:`${colors.primary.a1}50`}}>
                            <Icon name={"arrow-right"} type='Feather' style={{color:colors.text.a1, fontSize:25}}/>
                        </View>
                    </TouchableOpacity>
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
                    <NumberCoins transparent={50}/>
                }
                {
                    setting&&
                    <TouchableOpacity onPress={()=>navigate("ConnectingLettersStageGame")} activeOpacity={0.8}>
                        <View style={{justifyContent:'center', alignItems:'center', height:40, width:40, borderWidth:1, borderRadius:8, borderColor:colors.border.a1, backgroundColor:`${colors.primary.a1}50`}}>
                            <Icon name={"settings-outline"} type='Ionicons' style={{color:colors.text.a1, fontSize:25}}/>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        </View>
    )
}
const areEqual = (prevProps, nextProps) => {
  if (prevProps.transparent !== nextProps.transparent) return false;
  return true;
};

export default memo(SeasonHeader, areEqual);
