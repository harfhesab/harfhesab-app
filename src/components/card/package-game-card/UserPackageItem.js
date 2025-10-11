import React, {memo} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import ImageComponent from '../../image-components/ImageComponent';
import LocalImageComponent from '../../image-components/LocalImageComponent';

const width = Dimensions.get('window').width
function UserPackageItem({_id, packageId, title, image, accessType, price, numberStage, numberSeason, click}){
    const colors = useAppTheme();
    const accessTypeText = 
    accessType == "free"?"دسترسی رایگان":
    accessType == "subscription"?"دسترسی با اشتراک":
    (accessType == "coin-payment" && price && price > 0)?`دسترسی با پرداخت ${price} سکه`:
    (accessType == "coin-payment" && (!price || price == 0))?"دسترسی با پرداخت سکه":null

    
    return (
        <View style={{alignItems:'center', justifyContent:'center'}}>
            <TouchableNativeFeedback onPress={click} background={TouchableNativeFeedback.Ripple(colors.border.a1,false)}>
                <View style={{width:width, flexDirection:'row', gap:10, alignItems:'center', justifyContent:'flex-start', paddingHorizontal:15, paddingVertical:10}}>
                    <View style={{width:90, height:90, alignItems:'center', justifyContent:'center', backgroundColor:colors.border.a1, borderRadius:10}}>
                        {
                            image?
                            <ImageComponent
                                uri={image}
                                width={90}
                                height={90}
                                resizeMode="cover"
                                borderRadius={10}
                            />
                            :
                            <Icon name={'camera-off'} type={'Feather'} style={{fontSize:40, color:colors.text.a5}}/>
                        }
                    </View>
                    <View style={{flexDirection:'column', alignItems:'flex-start', gap:5}}>
                        <Text numberOfLines={1} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:14, textAlign:"center"}}>{title}</Text>
                        <Text numberOfLines={1} style={{fontFamily:Font.medium, color:colors.text.a4, fontSize:12, textAlign:"center"}}>{`${numberSeason} فصل  -  ${numberStage} مرحله`}</Text>
                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:5}}>
                            {
                                accessType == "subscription"?
                                <LocalImageComponent
                                    path={require('../../../assets/image/diamond.png')}
                                    width={14}
                                    height={14}
                                    resizeMode={'cover'}
                                    blank_background={true}
                                />
                                :accessType == "coin-payment"?
                                <LocalImageComponent
                                    path={require('../../../assets/image/coin.png')}
                                    width={14}
                                    height={14}
                                    resizeMode={'cover'}
                                    blank_background={true}
                                />
                                :<Icon name={"cruelty-free"} type={"MaterialIcons"} style={{fontSize:14, color:colors.primary.a1}}/>
                            }
                            {accessTypeText&&<Text numberOfLines={1} style={{fontFamily:Font.medium, color:colors.text.a6, fontSize:10, textAlign:"center"}}>{accessTypeText}</Text>}
                        </View>
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};
export default memo(UserPackageItem)