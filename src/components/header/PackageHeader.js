import React, {memo} from "react";
import {StyleSheet, View, Text, Dimensions, TouchableNativeFeedback, TouchableOpacity, ImageBackground} from 'react-native';
import Icon from "../../utils/Icon";
import Font from "../../utils/Font";
import useAppTheme from "../../hooks/theme/useAppTheme";
import NumberCoins from "../coin/NumberCoins";
import Back from "../icon/Back";
import Setting from "../icon/Setting";
import ImageComponent from "../image-components/ImageComponent";

const {width} = Dimensions.get('window');
function PackageHeader({height=65, paddingHorizontal=10, back=true, coin=true, title, setting=true, packageIcon}){
    const colors = useAppTheme();
    return(
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

export default memo(PackageHeader);
