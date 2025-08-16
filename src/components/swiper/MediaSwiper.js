import React, {memo} from "react";
import {StyleSheet, View, Dimensions, TouchableOpacity} from 'react-native';
import Swiper from 'react-native-swiper';
import useAppTheme from "../../hooks/theme/useAppTheme";
import ImageComponent from "../image-components/ImageComponent";

const width = Dimensions.get('window').width;
const bannerWidth = width > 600?460:width - 30
function MediaSwiper({items}){
    const colors = useAppTheme();
    const onClickItem = (item)=>{
        
    }
    return(
        <View style={{width:bannerWidth, height:bannerWidth * 0.7, alignItems:'center', justifyContent:'center', borderRadius:20, alignSelf:'center'}}>
            <Swiper
                style={styles.swiper}
                showsButtons={false}
                index={items.length - 1}
                activeDotColor={colors.primary.a1}
                dotColor={'#ffffff95'}
                autoplay={true}
                autoplayTimeout={4}
                autoplayDirection={false}
            >
                {
                    items.map((item, index)=>(
                        <TouchableOpacity onPress={()=>{onClickItem(item)}} key={index.toString()} activeOpacity={0.8}>
                            <ImageComponent
                                uri={item?.path}
                                width={bannerWidth}
                                height={bannerWidth * 0.7}
                                resizeMode="cover"
                                borderRadius={15}
                            />
                        </TouchableOpacity>
                    ))
                }
            </Swiper>
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
    if (prevProps.items !== nextProps.items) return false;
    return true;
};
export default memo(MediaSwiper, areEqual)