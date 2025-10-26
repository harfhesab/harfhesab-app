import React, {memo} from 'react';
import {View, Text, TouchableNativeFeedback, Dimensions, ImageBackground, TouchableOpacity} from 'react-native';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import FastImage from '@d11/react-native-fast-image';
import Globals from '../../../utils/Globals';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import ImageComponent from '../../image-components/ImageComponent';
import LocalImageComponent from '../../image-components/LocalImageComponent';
import WoodProgressBar from '../../WoodProgressBar';
import { IS_TABLET_CONDITION } from '../../../utils/constants/constants';

const width = Dimensions.get('window').width
function UserPackageItem({_id, packageId, title, image, accessType, price, numberStage, numberSeason, click, progress}){
    const colors = useAppTheme();
    const accessTypeText = 
    accessType == "free"?"دسترسی رایگان":
    accessType == "subscription"?"دسترسی با اشتراک":
    (accessType == "coin-payment" && price && price > 0)?`دسترسی با پرداخت ${price} سکه`:
    (accessType == "coin-payment" && (!price || price == 0))?"دسترسی با پرداخت سکه":null

    
    return (
        <View style={{alignItems:'center', justifyContent:'center'}}>
            <TouchableOpacity onPress={click} activeOpacity={0.7}>
                <ImageBackground
                    source={require("../../../assets/image/horizontal_card.png")}
                    style={{ width: width - 50, height: 110, paddingBottom:2}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{width:"100%", height:"100%", flexDirection:'row', gap:5, alignItems:'center', justifyContent:'flex-start', paddingHorizontal:10, paddingVertical:10}}>
                        <View style={{width:85, height:85, alignItems:'center', justifyContent:'center', backgroundColor:colors.border.a1, borderRadius:15}}>
                            {
                                image?
                                <ImageComponent
                                    uri={image}
                                    width={85}
                                    height={85}
                                    resizeMode="cover"
                                    borderRadius={15}
                                />
                                :
                                <Icon name={'camera-off'} type={'Feather'} style={{fontSize:40, color:colors.text.a5}}/>
                            }
                        </View>
                        <View style={{flexDirection:'column', alignItems:'flex-start'}}>
                            <Text numberOfLines={1} style={{fontFamily:Font.bold, color:colors.text.a1, fontSize:14, textAlign:"center"}}>{title}</Text>
                            <Text numberOfLines={1} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:10, textAlign:"center"}}>{`${numberSeason} فصل  -  ${numberStage} مرحله`}</Text>
                            <View style={{flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:5}}>
                                {
                                    accessType == "subscription"?
                                    <LocalImageComponent
                                        path={require('../../../assets/image/diamond.png')}
                                        width={12}
                                        height={12}
                                        resizeMode={'cover'}
                                        blank_background={true}
                                    />
                                    :accessType == "coin-payment"?
                                    <LocalImageComponent
                                        path={require('../../../assets/image/coin.png')}
                                        width={12}
                                        height={12}
                                        resizeMode={'cover'}
                                        blank_background={true}
                                    />
                                    :<Icon name={"cruelty-free"} type={"MaterialIcons"} style={{fontSize:12, color:colors.primary.a1}}/>
                                }
                                {accessTypeText&&<Text numberOfLines={1} style={{fontFamily:Font.medium, color:colors.text.a4, fontSize:10, textAlign:"center"}}>{accessTypeText}</Text>}
                            </View>
                            <WoodProgressBar
                                progressWidth={IS_TABLET_CONDITION?200:width-165}
                                progress={progress}
                                maxValue={numberStage}
                                showValue={true}
                            />
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </View>
    );
};
export default memo(UserPackageItem)