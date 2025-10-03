import React, { memo } from "react";
import { View, TouchableOpacity, Text, Image } from 'react-native';
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
            <View style={{justifyContent:'center', alignItems:'center', height:40, borderWidth:1, borderRadius:8, borderColor:colors.border.a1, backgroundColor:`${colors.primary.a1}${transparent}`}}>
                <Text style={{fontFamily:Font.medium, fontSize:13, color:colors.text.a1, paddingHorizontal:15}}>{"راهنما"}</Text>
                <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    <Image
                        style={{height:12, width:12}}
                        source={require('../../assets/image/coin.png')}
                    />
                    <Text style={{fontFamily:Font.black, fontSize:11, color:colors.text.a1}}>{numberCoinsHelp}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default memo(NumberCoinsHelp);
