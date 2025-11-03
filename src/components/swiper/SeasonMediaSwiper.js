import React, {memo} from "react";
import {StyleSheet, View, Dimensions, TouchableOpacity, ImageBackground} from 'react-native';
import Swiper from 'react-native-swiper';
import useAppTheme from "../../hooks/theme/useAppTheme";
import ImageComponent from "../image-components/ImageComponent";
import { IS_TABLET_CONDITION } from "../../utils/constants/constants";
import SimpleBorderText from "../text-components/SimpleBorderText";
import MaskedView from '@react-native-masked-view/masked-view';


const width = Dimensions.get("screen").width;
function SeasonMediaSwiper({items, title, height}){
    const bannerWidth = IS_TABLET_CONDITION?460:width - 20
    const mediaWidth = bannerWidth*0.94
    const mediaHeight = height*0.85
    const titleWidth = bannerWidth - 100
    const colors = useAppTheme();
    const onClickItem = (item)=>{
        return
    }
    return(
        <View style={{width:width, alignItems:'center'}}>
            <ImageBackground
                source={require("../../assets/image/horizontal_frame.png")}
                style={{ width: bannerWidth, height: height, justifyContent: "center", alignItems: "center", paddingTop:height*0.023}}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
                <MaskedView
                    style={{
                        width: mediaWidth,
                        height: mediaHeight,
                        alignSelf: 'center',
                        borderRadius: 18,
                    }}
                    maskElement={
                        <View
                        style={{
                            backgroundColor: 'black',
                            width: mediaWidth,
                            height: mediaHeight,
                            borderRadius: 18,
                        }}
                        />
                    }
                    >
                        {
                            items?.length > 0&&
                            <Swiper
                                style={styles.swiper}
                                showsButtons={false}
                                index={items?.length - 1}
                                activeDotColor={colors.primary.a1}
                                dotColor={'#ffffff95'}
                                autoplay={true}
                                autoplayTimeout={10}
                                autoplayDirection={false}
                            >
                                {items?.map((item, index) => (
                                <TouchableOpacity
                                    key={index.toString()}
                                    onPress={() => onClickItem(item)}
                                    activeOpacity={0.85}
                                >
                                    <ImageComponent
                                        uri={item?.path}
                                        width={mediaWidth}
                                        height={mediaHeight}
                                        resizeMode="cover"
                                        borderRadius={18}
                                    />
                                </TouchableOpacity>
                                ))}
                            </Swiper>
                        }
                    </MaskedView>
            </ImageBackground>
            <View style={{position:'absolute'}}>
                <ImageBackground
                    source={require("../../assets/image/frame_stage_title.png")}
                    style={{ width: titleWidth, height: titleWidth/4.21, justifyContent: "center", alignItems: "center", top:-titleWidth/10}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <SimpleBorderText
                        text={title}
                        width={titleWidth}
                        height={17*1.6}
                        fontSize={17}
                        borderWidth={2}
                    />
                </ImageBackground>
            </View>
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
export default memo(SeasonMediaSwiper)