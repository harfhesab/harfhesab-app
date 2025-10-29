import React, {memo} from 'react';
import {View, Text, Dimensions, ImageBackground, TouchableOpacity} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import ImageComponent from '../../image-components/ImageComponent';
import { navigate } from '../../../main/navigationService';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';
import { priceDigitSeperator } from '../../../utils/PriceDigitSeperator';
import ButtonImgSrc from '../../buttons/ButtonImgSrc';

const width = Dimensions.get('window').width
const size = IS_TABLET_CONDITION?(width-105)/4:(width-75)/2
function reverseString(str) {
  return str.split("").reverse().join("");
}
function SubscriptionPlanItem({_id, productId, title, badg, image, duration, price, active}){
    const colors = useAppTheme();

    const click = ()=>{
        navigate("PackageInformation", {_id})
    }
    return (
        <View style={{alignItems:'center', justifyContent:'center'}}>
            <TouchableOpacity activeOpacity={0.95} onPress={click}>
                <ImageBackground
                    source={require("../../../assets/image/card_3.png")}
                    style={{ width: size, height: size*1.75, paddingTop:"4%", paddingBottom:"9%", paddingStart:"1.3%"}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{flexDirection:'column', alignItems:'center', justifyContent:"space-between", width:"100%", height:"100%"}}>
                        <View style={{width:size*0.91, height:size*0.91, alignItems:'center', justifyContent:'center', backgroundColor:colors.border.a1, borderTopLeftRadius:size*0.11, borderTopRightRadius:size*0.11, borderBottomLeftRadius:5, borderBottomRightRadius:5}}>
                            <ImageComponent
                                uri={image}
                                width={size*0.91}
                                height={size*0.91}
                                resizeMode="stretch"
                                style={{borderTopLeftRadius:size*0.11, borderTopRightRadius:size*0.11, borderBottomLeftRadius:5, borderBottomRightRadius:5}}
                                placeHolderImage={require("../../../assets/image/diamond.png")}
                            />
                        </View>
                        <View>
                            <Text numberOfLines={2} style={{fontFamily:Font.bold, color:colors.primary.a3, fontSize:18, textAlign:"center"}}>{`${priceDigitSeperator(duration)} روز اشتراک`}</Text>
                            <Text numberOfLines={2} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:8, textAlign:"center", marginBottom:10}}>{`( ${title} )`}</Text>
                            <ButtonImgSrc
                                onPress={click}
                                fontSize={12}
                                textWidth={size - 20}
                                text={`${reverseString(priceDigitSeperator(price/10))} تومان`}
                                height={40}
                                width={size - 20}
                                imageSrc={"2"}
                            />
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </View>
    );
};
export default memo(SubscriptionPlanItem)