import React, {memo} from 'react';
import {View, Text, TouchableOpacity, Image, ImageBackground} from 'react-native';
import Font from '../../utils/Font';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import useAppTheme from '../../hooks/theme/useAppTheme';
import LinearGradient from 'react-native-linear-gradient';
import TextGradientSvg from '../text-components/TextGradientSvg';

function AdsButton(
    { onPress, reward, width=160, height=55, fontSize=15, textColor="#FFFFFF"}
){
    const colors = useAppTheme();
    return(
        <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={{width, height, alignItems:'center', justifyContent:'center'}}>
            <ImageBackground
                source={require("../../assets/image/ads_btn_blu.png")}
                style={{ width, height, alignItems:'center', justifyContent:'center', paddingBottom:5 }}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5, height:"100%", paddingHorizontal:10}}>
                    
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', gap:2}}>
                        <Image
                            style={{width:fontSize*1.1, height:fontSize*1.1}}
                            source={require('../../assets/image/coin.png')}
                        />
                        <TextGradientSvg
                            text={`+ ${reward}`}
                            fontFamily={Font.bakh_extra_bold}
                            fontSize={fontSize}
                            colors={["#FFFFFF", "#fff5c8"]}
                            shadowColor={"#00000090"}
                            shadowBlur={5}
                            dropShadow={true}
                            borderColor={"#000000"}
                            borderWidth={1}
                            glowBlur={100}
                            glowColor={'#fff5c8'}
                            glowShadow={true}
                        />
                    </View>
                    <TextGradientSvg
                        text={"دیدن تبلیغ"}
                        fontFamily={Font.bakh_extra_bold}
                        fontSize={fontSize}
                        colors={["#FFFFFF", "#fff5c8"]}
                        shadowColor={"#00000090"}
                        shadowBlur={5}
                        dropShadow={true}
                        borderColor={"#000000"}
                        borderWidth={1}
                        glowBlur={100}
                        glowColor={'#fff5c8'}
                        glowShadow={true}
                    />
                </View>
            </ImageBackground>
        </TouchableOpacity>
    )
}
export default memo(AdsButton);