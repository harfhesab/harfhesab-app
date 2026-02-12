import React, { memo } from "react";
import { View, TouchableOpacity, Text, Image, ImageBackground } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import Font from "../../utils/Font";
import { reduceNumberCoins } from "../../redux/slices/coinSlice";
import { showToast } from "../custom-toast/ToastRef";

function MeaningSentence({ onPress = () => {}, numberCoinsHelp }) {
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
                message: "موجودی سکهٔ شما برای دیدن معنی جمله کافی نیست!",
                type: "error",
                animationType: "slide",
                position: "top",
            });
        }
    };

    return (
        <TouchableOpacity 
              onPress={onClick}
              activeOpacity={0.6}
              style={{alignItems:'center', justifyContent:'center'}}
            >
              <ImageBackground
                  source={require("../../assets/image/card_1.png")}
                  style={{ width: 40, height: 52, justifyContent: "center", alignItems: "center" }}
                  imageStyle={{ resizeMode: "stretch" }}
                  resizeMode="stretch"
              >
                 <View style={{width:"100%", height:"100%", alignItems:"center", justifyContent:"center", gap:3}}>
                    <Text style={{fontFamily:Font.medium, fontSize:11, color:"#FFF"}}>{"معنی"}</Text>
                    {
                        numberCoinsHelp > 0&&
                        <View style={{flexDirection:'row', alignItems:'center', gap:3}}>
                            <Text style={{fontFamily:Font.bold, fontSize:11, color:"#FFFFFF"}}>{numberCoinsHelp}</Text>
                            <Image
                                style={{height:12, width:12}}
                                source={require('../../assets/image/coin.png')}
                            />
                        </View>
                    }
                 </View>
              </ImageBackground>
        </TouchableOpacity>
    );
}

export default memo(MeaningSentence);
