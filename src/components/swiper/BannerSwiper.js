import React, {useMemo, memo} from "react";
import {StyleSheet, View, Dimensions, TouchableOpacity, FlatList} from 'react-native';
import Swiper from 'react-native-swiper';
import useAppTheme from "../../hooks/theme/useAppTheme";
import ImageComponent from "../image-components/ImageComponent";

const width = Dimensions.get('window').width;
const bannerWidth = width > 600?460:width - 50
function BannerSwiper({items}){
    const colors = useAppTheme();
    const onClickItem = (item)=>{
        
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
                onEndReachedThreshold={0.5}
                contentContainerStyle={{paddingHorizontal:15, gap:15}}
                snapToAlignment="start"       // آیتم از بالا چفت شود
                decelerationRate="fast"       // سرعت کاهش سریع برای اسنپ بهتر
                disableIntervalMomentum={true} // محدود کردن اسکرول به فقط یک interval در هر سوایپ
                bounces={true}                // فنری بودن مانند iOS
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