import React, {memo} from "react";
import { View, TouchableOpacity, Image, Text} from 'react-native';
import useAppTheme from "../../hooks/theme/useAppTheme";
import { useSelector } from "react-redux";
import Icon from "../../utils/Icon";
import Font from "../../utils/Font";
import { priceDigitSeperator } from "../../utils/PriceDigitSeperator";

function NumberCoins({onPress}){
    const colors = useAppTheme();
    const { numberCoins } = useSelector((state) => state.coin);

    const onClick = ()=>{
        onPress?.()
    }
    return(
        <TouchableOpacity activeOpacity={0.85} onPress={onClick}>
            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:10, width:140, backgroundColor:"#00000060", borderWidth:1, borderRadius:8, borderColor:colors.border.a1, height:40}}>
                <View>
                    <Image
                        style={{height:25, width:25}}
                        source={require('../../assets/image/coin.png')}
                    />
                </View>
                <Text style={{fontFamily:Font.medium, fontSize:15, color:colors.text.a1}}>{priceDigitSeperator(numberCoins)}</Text>
                <View style={{alignItems:'center', justifyContent:'center'}}>
                    <Icon name={"plus-square-o"} type={"FontAwesome"} style={{fontSize:25, color:"#ff9800"}}/>
                </View>
            </View>
        </TouchableOpacity>
    )
}
const areEqual = (prevProps, nextProps) => {
    if (prevProps.onPress !== nextProps.onPress) return false;
    return true;
};
export default memo(NumberCoins, areEqual)