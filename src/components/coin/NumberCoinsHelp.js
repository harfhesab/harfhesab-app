import React, { memo } from "react";
import { View, TouchableOpacity, Text, Image, ImageBackground } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import Font from "../../utils/Font";
import { reduceNumberCoins } from "../../redux/slices/coinSlice";
import { showToast } from "../custom-toast/ToastRef";

function NumberCoinsHelp({ onPress = () => {}, numberCoinsHelp }) {
    const dispatch = useDispatch();
    const { numberCoins } = useSelector((state) => state.coins);

    const onClick = () => {
        if(numberCoins >= numberCoinsHelp){
            if(onPress?.() == true){
                dispatch(reduceNumberCoins({number:numberCoinsHelp}))
            }
        } else {
            showToast({
                title: "عدم موجودی سکه",
                message: "موجودی سکهٔ شما برای دریافت راهنمایی کافی نیست!",
                type: "error",
                animationType: "slide",
                position: "top",
            });
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
                    <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', height:"100%", width:"100%", overflow:'hidden', paddingBottom:2, paddingHorizontal:10}}>
                        <View style={{flexDirection:'row', alignItems:'center', gap:3}}>
                            <Text style={{fontFamily:Font.bakh_extra_bold, fontSize:11, color:"#FFFFFF"}}>{numberCoinsHelp}</Text>
                            <Image
                                style={{height:12, width:12}}
                                source={require('../../assets/image/coin.png')}
                            />
                        </View>
                        <Text style={{fontFamily:Font.bakh_bold, fontSize:11, color:"#FFFFFF"}}>{"راهنما"}</Text>
                    </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

export default memo(NumberCoinsHelp);
