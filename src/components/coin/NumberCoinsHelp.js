import React, { memo } from "react";
import { View, TouchableOpacity, Text, Image, ImageBackground } from 'react-native';
import useAppTheme from "../../hooks/theme/useAppTheme";
import { useDispatch, useSelector } from "react-redux";
import Font from "../../utils/Font";
import { reduceNumberCoins } from "../../redux/slices/coinSlice";
import Toast from "react-native-toast-message";

function NumberCoinsHelp({ onPress = () => {}, transparent = 40, numberCoinsHelp }) {
    const colors = useAppTheme();
    const dispatch = useDispatch();
    const { numberCoins } = useSelector((state) => state.coins);

    const onClick = () => {
        if(numberCoins >= numberCoinsHelp){
            if(onPress?.() == true){
                dispatch(reduceNumberCoins({number:numberCoinsHelp}))
            }
        } else {
            Toast.show({
                type: "error",
                text1: "موجودی سکهٔ شما برای دریافت راهنمایی کافی نیست!",
                visibilityTime: 4000
            })
        }
    };

    return (
        <TouchableOpacity onPress={onClick} activeOpacity={0.7}>
            <ImageBackground
                    source={require("../../assets/image/button_6.png")}
                    style={{ width: 83, height: 40, justifyContent: "center", alignItems: "center" }}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', height:"100%", width:"100%", overflow:'hidden', paddingBottom:2, paddingHorizontal:8}}>
                        <View style={{flexDirection:'row', alignItems:'center', gap:2}}>
                            <Text style={{fontFamily:Font.black, fontSize:11, color:colors.text.a1}}>{numberCoinsHelp}</Text>
                            <Image
                                style={{height:15, width:15}}
                                source={require('../../assets/image/coin.png')}
                            />
                        </View>
                        <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a1}}>{"راهنما"}</Text>
                    </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

export default memo(NumberCoinsHelp);
