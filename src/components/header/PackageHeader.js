import React, {memo} from "react";
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, ImageBackground, NativeModules, StatusBar} from 'react-native';
import Icon from "../../utils/Icon";
import Font from "../../utils/Font";
import useAppTheme from "../../hooks/theme/useAppTheme";
import NumberCoins from "../coin/NumberCoins";
import Back from "../icon/Back";
import Setting from "../icon/Setting";
import ImageComponent from "../image-components/ImageComponent";
import SimpleBorderText from "../text-components/SimpleBorderText";
import { STATUS_BAR_HEIGHT } from "../../utils/constants/constants";
import { navigate } from "../../main/navigationService";

const {width} = Dimensions.get('screen');
const { ImmersiveMode } = NativeModules;
function PackageHeader({height=65, paddingHorizontal=10, back=true, coin=true, title, setting=true, packageIcon, packageId}){
    const colors = useAppTheme();
    const packageInfoClick = ()=>{
        ImmersiveMode.exitImmersiveMode()
        StatusBar.setHidden(false);
        navigate("PackageInformation", {_id:packageId});
    }
    return(
        <View style={{backgroundColor:colors.header.background, paddingTop:STATUS_BAR_HEIGHT}}>
            <View style={{backgroundColor:colors.header.background, shadowColor:colors.shadow.a2, elevation:5, height:height, width:width, flexDirection:'row', alignItems:'center', paddingHorizontal:paddingHorizontal, justifyContent:'space-between', zIndex:1000}}>
                <View style={{height:"100%", flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:10}}>
                    {
                        back&&
                        <Back/>
                        
                    }
                    {
                        packageIcon&&
                        <TouchableOpacity activeOpacity={0.7} onPress={packageInfoClick}>
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
                                <Text numberOfLines={1} style={{color:"#FFF", fontFamily:Font.medium, fontSize:6}}>{"بستهٔ بازی"}</Text>
                            </ImageBackground>
                        </TouchableOpacity>
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
        </View>
    )
}

export default memo(PackageHeader);
