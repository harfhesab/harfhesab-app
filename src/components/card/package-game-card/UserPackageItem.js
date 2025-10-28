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
function UserPackageItem({_id, packageId, title, image, accessType, price, numberStage, numberSeason, click, progress, contentCompleted}){
    const colors = useAppTheme();
    const accessTypeText = 
    accessType == "free"?"دسترسی رایگان":
    accessType == "subscription"?"دسترسی با اشتراک":
    (accessType == "coin-payment" && price && price > 0)?`دسترسی با پرداخت ${price} سکه`:
    (accessType == "coin-payment" && (!price || price == 0))?"دسترسی با پرداخت سکه":null

    
    return (
        <View style={{alignItems:'center', justifyContent:'center'}}>
            <TouchableOpacity onPress={click} activeOpacity={0.9}>
                <ImageBackground
                    source={require("../../../assets/image/thick_rectangle_card.png")}
                    style={{ width: width - 50, height: 160, paddingBottom:2}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{width:"100%", height:110, flexDirection:'row', gap:5, alignItems:'center', justifyContent:'flex-start', paddingHorizontal:10, paddingVertical:10}}>
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
                        <View style={{flexDirection:'column', alignItems:'flex-start', height:'100%', justifyContent:'space-between'}}>
                            <View>
                                <Text numberOfLines={1} style={{fontFamily:Font.bold, color:colors.text.a1, fontSize:14}}>{title}</Text>
                                <Text numberOfLines={1} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:10}}>{`${numberSeason} فصل  -  ${numberStage} مرحله`}</Text>
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
                                    {accessTypeText&&<Text numberOfLines={1} style={{fontFamily:Font.medium, color:colors.text.a4, fontSize:10}}>{accessTypeText}</Text>}
                                </View>
                            </View>
                            <WoodProgressBar
                                    progressWidth={IS_TABLET_CONDITION?200:width-160}
                                    progress={progress}
                                    maxValue={numberStage}
                                    showValue={true}
                                />
                        </View>
                    </View>
                    <View style={{width:"100%", alignItems:'flex-end', bottom:-8, paddingEnd:20}}>
                        <TouchableOpacity onPress={click} activeOpacity={0.8} style={{}}>
                            <ImageBackground
                                source={require("../../../assets/image/wood_blue_button.png")}
                                style={{ width: IS_TABLET_CONDITION?180:140, height: IS_TABLET_CONDITION?70:54, alignItems:'center', justifyContent:'center', paddingBottom:7}}
                                imageStyle={{ resizeMode: "stretch" }}
                                resizeMode="stretch"
                            >
                                <Text style={{fontFamily:Font.iran_yekan_black_fa, fontSize:15, color:"#fcb900"}}>{contentCompleted==true?'بازی':'دانلود محتوا'}</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </View>
    );
};
export default memo(UserPackageItem)