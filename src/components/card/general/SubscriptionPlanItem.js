import React, {memo} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions} from 'react-native';
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
const size = IS_TABLET_CONDITION?(width-75)/4:(width-45)/2
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
            <TouchableNativeFeedback onPress={click} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                <View style={{flexDirection:'column', width:size, alignItems:'center', justifyContent:'flex-start', paddingVertical:10, borderColor:colors.border.a1, borderWidth:1, borderRadius:10, backgroundColor:`${colors.primary.a2}40`}}>
                    <View style={{width:size - 20, height:size - 20, alignItems:'center', justifyContent:'center', backgroundColor:colors.border.a1, borderRadius:10}}>
                        <ImageComponent
                            uri={image}
                            width={size - 20}
                            height={size - 20}
                            resizeMode="cover"
                            borderRadius={10}
                        />
                    </View>
                    <View>
                        <Text numberOfLines={2} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:16, textAlign:"center"}}>{`${priceDigitSeperator(duration)} روز اشتراک`}</Text>
                        <Text numberOfLines={2} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:6, textAlign:"center", marginBottom:10}}>{`( ${title} )`}</Text>
                        <ButtonImgSrc
                            onPress={click}
                            fontSize={14}
                            textWidth={size - 20}
                            text={`${reverseString(priceDigitSeperator(price/10))} تومان`}
                            height={40}
                            width={size - 20}
                            imageSrc={"2"}
                        />
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};
export default memo(SubscriptionPlanItem)