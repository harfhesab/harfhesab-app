import React, {useMemo, memo} from "react";
import {StyleSheet, View, Dimensions, TouchableOpacity, FlatList, TouchableNativeFeedback, Text} from 'react-native';
import Swiper from 'react-native-swiper';
import useAppTheme from "../../hooks/theme/useAppTheme";
import ImageComponent from "../image-components/ImageComponent";
import ButtonBorder from "../buttons/ButtonBorder";
import Font from "../../utils/Font";
import { navigate } from "../../main/navigationService";

const width = Dimensions.get('window').width;

const bannerWidth = width > 600 ? 460 : width - 50
const itemGap = 15
const snapInterval = bannerWidth + itemGap
function BannerSwiper({items}){
    const colors = useAppTheme();
    const onClickItem = (item)=>{
        if(item.click_type == "enternal-navigate"){
            if(item.navigate == "PackageInformation"){
                const _id = item.package._id
                navigate("PackageInformation", {_id})
            }
        }
    }
    const renderItem = ({item, index})=>{
        return(
            <TouchableOpacity onPress={()=>{onClickItem(item)}} key={index.toString()} activeOpacity={0.8}>
                <ImageComponent
                    uri={item?.path}
                    width={bannerWidth}
                    height={bannerWidth/2}
                    resizeMode="cover"
                    borderRadius={10}
                />
                {
                    item.package&&
                    <View style={{width:bannerWidth}}>
                        <TouchableNativeFeedback onPress={()=>{onClickItem(item)}} style={{width:"100%"}} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                            <View style={{width:"100%", flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:10}}>
                                <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                                    <View style={{width:45, height:45, alignItems:'center', justifyContent:'center', backgroundColor:colors.border.a1, borderRadius:15}}>
                                        {
                                            item.package?.icon_image?
                                            <ImageComponent
                                                uri={item.package.icon_image}
                                                width={45}
                                                height={45}
                                                resizeMode="cover"
                                                borderRadius={10}
                                            />
                                            :
                                            <Icon name={'camera-off'} type={'Feather'} style={{fontSize:20, color:colors.text.a5}}/>
                                        }
                                    </View>
                                    <View style={{flexDirection:'column', alignItems:'flex-start'}}>
                                        <Text numberOfLines={2} style={{fontFamily:Font.bakh_semi_bold, color:colors.text.a2, fontSize:13, textAlign:"center"}}>{item.package?.title}</Text>
                                    </View>
                                </View>
                                <View>
                                    <ButtonBorder
                                        text={"دریافت بازی"}
                                        height={35}
                                        width={110}
                                        loading={false}
                                        onPress={()=>{onClickItem(item)}}
                                        borderRadius={20}
                                        textSize={13}
                                        borderWidth={1}
                                    />
                                </View>
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                }
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
export default memo(BannerSwiper)