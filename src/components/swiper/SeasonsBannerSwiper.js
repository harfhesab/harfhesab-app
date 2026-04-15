import React, {useMemo, memo} from "react";
import {StyleSheet, View, Dimensions, TouchableOpacity, FlatList, TouchableNativeFeedback, Text} from 'react-native';
import Swiper from 'react-native-swiper';
import useAppTheme from "../../hooks/theme/useAppTheme";
import ImageComponent from "../image-components/ImageComponent";
import ButtonBorder from "../buttons/ButtonBorder";
import Font from "../../utils/Font";
import { navigate } from "../../main/navigationService";

const width = Dimensions.get('window').width;

const bannerWidth = width > 600 ? 460 : width - 70
const itemGap = 15
const snapInterval = bannerWidth + itemGap
function SeasonsBannerSwiper({items}){
    const colors = useAppTheme();
    const onClickItem = (item)=>{
        
    }
    const renderItem = ({item, index})=>{
        return(
            <TouchableOpacity onPress={()=>{onClickItem(item)}} key={index.toString()} activeOpacity={0.8} style={{backgroundColor:`${colors.primary.a6}10`, paddingBottom:10, borderRadius:10, gap:10}}>
                <ImageComponent
                    uri={item?.first_media?.path}
                    width={bannerWidth}
                    height={bannerWidth/2}
                    resizeMode="cover"
                    borderRadius={10}
                />
                <View style={{width:bannerWidth, flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:10}}>
                    <Text numberOfLines={1} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:12, textAlign:"center", maxWidth:bannerWidth-100}}>{item?.title}</Text>
                    {item?.number_stage&&
                        <View style={{backgroundColor:`${colors.primary.a6}30`, paddingHorizontal:10, borderRadius:20}}>
                            <Text style={{fontFamily:Font.medium, color:colors.primary.a6, fontSize:12, textAlign:"center"}}>{`${item?.number_stage} مرحله`}</Text>
                        </View>
                    }
                </View>
            </TouchableOpacity>
        )
    }
    const memoizedValue = useMemo(() => renderItem, [items]);
    const keyExtractor = (item,index)=>index.toString()
    return(
        <View style={{width:width, alignItems:'center', justifyContent:'center'}}>
           <FlatList
                keyExtractor={keyExtractor}
                data={items}
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                renderItem={memoizedValue}
                contentContainerStyle={{
                    paddingHorizontal: 15,
                    paddingVertical: 15,
                    gap: itemGap,
                }}
                snapToInterval={snapInterval}      // 📌 هر آیتم + فاصله
                snapToAlignment="start"            // آیتم از چپ چفت شود
                decelerationRate="fast"            // سرعت اسنپ بهتر
                disableIntervalMomentum={true}     // محدود کردن اسکرول به یکی یکی
                disableScrollViewPanResponder={true}
                bounces={true}                     // فنری بودن مثل iOS
            />
        </View>
    )
}
const styles = StyleSheet.create({
    swiper:{
        justifyContent:'center',
        alignItems:'center',
        flexDirection: 'row-reverse',
    },
});
export default memo(SeasonsBannerSwiper)