import React, {memo} from "react";
import {StyleSheet, View, Dimensions, TouchableOpacity} from 'react-native';
// import Swiper from 'react-native-swiper';
import FastImage from '@d11/react-native-fast-image';
import useAppTheme from "../hooks/theme/useAppTheme";

const width = Dimensions.get('window').width;
const bannerWidth = width > 600?460:width - 30
function BannerSwiper({navigation, banner}){
    const colors = useAppTheme();
    const onClickItem = (item)=>{
        if(item?.url && (item?.url?.includes("http://") || item?.url?.includes("https://"))){
            navigation.navigate("WebViewScreen", {url:item.url})
        } else if(item.type.includes("image")){
            navigation.navigate("SingleImageScreen", {url:item.src})
        }
    }
    return(
        <View style={{width:bannerWidth, height:bannerWidth * 0.45, alignItems:'center', justifyContent:'center', borderRadius:20, alignSelf:'center'}}>
            {/* <Swiper
                style={styles.swiper}
                showsButtons={false}
                index={banner.length - 1}
                activeDotColor={colors.color}
                dotColor={'#ffffff95'}
                autoplay={true}
                autoplayTimeout={4}
                autoplayDirection={false}
            >
                {
                    banner.map((item, index)=>(
                        <TouchableOpacity onPress={()=>{onClickItem(item)}} key={index.toString()} activeOpacity={0.8}>
                            <FastImage
                                style={{width:bannerWidth, height:bannerWidth * 0.45, borderRadius:20}}
                                source={{
                                    uri: item.src,
                                    priority: FastImage.priority.normal,
                                }}
                                resizeMode={FastImage.resizeMode.cover}
                            />
                        </TouchableOpacity>
                    ))
                }
            </Swiper> */}
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
const areEqual = (prevProps, nextProps) => {
    if (prevProps.banner !== nextProps.banner) return false;
    return true;
};
export default memo(BannerSwiper, areEqual)