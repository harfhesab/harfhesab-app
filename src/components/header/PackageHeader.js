import React, {memo} from "react";
import {StyleSheet, View, Text, Dimensions, TouchableNativeFeedback, TouchableOpacity, ImageBackground} from 'react-native';
import Icon from "../../utils/Icon";
import Font from "../../utils/Font";
import useAppTheme from "../../hooks/theme/useAppTheme";
import NumberCoins from "../coin/NumberCoins";
import Back from "../icon/Back";
import Setting from "../icon/Setting";
import ImageComponent from "../image-components/ImageComponent";
import SimpleBorderText from "../text-components/SimpleBorderText";

const {width} = Dimensions.get('screen');
function PackageHeader({height=65, paddingHorizontal=10, back=true, coin=true, title, setting=true, packageIcon}){
    const colors = useAppTheme();
    return(
        <ImageBackground
            source={require("../../assets/image/header_frame.png")}
            style={{ width: width, height: width*0.45, justifyContent: "space-between", alignItems: "center", paddingBottom:25}}
            imageStyle={{ resizeMode: "stretch" }}
            resizeMode="stretch"
        >
            <View style={{height:height, width:width, flexDirection:'row', alignItems:'center', paddingHorizontal:paddingHorizontal, justifyContent:'space-between', zIndex:1000}}>
                <View style={{height:"100%", flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:10}}>
                    {
                        back&&
                        <Back/>
                        
                    }
                    {
                        packageIcon&&
                        <View>
                            <ImageBackground
                                source={require("../../assets/image/free_button.png")}
                                style={{ width: 40, height: 40, justifyContent: "center", alignItems: "center", paddingStart:1, paddingBottom:1}}
                                imageStyle={{ resizeMode: "stretch" }}
                                resizeMode="stretch"
                            >
                                <ImageComponent
                                    uri={packageIcon}
                                    width={33}
                                    height={33}
                                    resizeMode="cover"
                                    borderRadius={15}
                                />
                            </ImageBackground>
                            <ImageBackground
                                source={require("../../assets/image/frame_badge.png")}
                                style={{ width: 30, height: 18, justifyContent: "center", alignItems: "center", position:'absolute', top:-5, alignSelf:'center' }}
                                imageStyle={{ resizeMode: "stretch" }}
                                resizeMode="stretch"
                            >
                                <Text numberOfLines={1} style={{color:"#FFF", fontFamily:Font.medium, fontSize:6}}>{"اطلاعات"}</Text>
                            </ImageBackground>
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
            <ImageBackground
                source={require("../../assets/image/header_title_frame.png")}
                style={{ width: width*0.8, height: width*0.8*0.233, alignItems:'center', justifyContent:'center', paddingBottom:10}}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
                {
                    title&&
                    <SimpleBorderText
                        text={title}
                        width={width*0.8 - 40}
                        height={18*1.6}
                        fontSize={18}
                        borderWidth={2}
                    />
                }
            </ImageBackground>
        </ImageBackground>
    )
}

export default memo(PackageHeader);
