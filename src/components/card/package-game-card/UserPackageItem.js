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
import { navigate } from '../../../main/navigationService';
import AlertBottomDrawerHelper from '../../alert-bottom-drawer/AlertBottomDrawerHelper';

const width = Dimensions.get('window').width
function UserPackageItem({_id, activeSubscription, packageId, title, image, accessType, price, numberStage, numberSeason, progress, contentCompleted, endedGame}){
    const colors = useAppTheme();
    const accessTypeText = 
    accessType == "free"?"دسترسی رایگان":
    accessType == "subscription"?"دسترسی با اشتراک امکان پذیر است":
    (accessType == "coin-payment" && price && price > 0)?`${price} سکه برای فعال سازی پرداخت شده است`:
    (accessType == "coin-payment" && (!price || price == 0))?`سکه برای فعال سازی پرداخت شده است`:null

    const startGame = ()=>{
        if(contentCompleted == true){
            if(accessType == "subscription" && activeSubscription == false){
                const btn = [
                    {
                        onPress : ()=>{
                            navigate("SubscriptionPlans")
                        },
                        text: "تهیهٔ اشتراک",
                        loading: false,
                        type: "bold",
                    },
                    {
                        onPress : ()=>{
                            navigate("PackageInformation", {_id:packageId.toHexString()})
                        },
                        text: "پرداخت سکه",
                        loading: false,
                        type: "border",
                    },
                ]
                const msg = [
                    {
                        text:"اشتراک فعال ندارید",
                        style:{ maxWidth:width-65, fontFamily:Font.bold, fontSize:20, color:colors.primary.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
                    },
                    {
                        text:"با توجه به اینکه این بستهٔ بازی را از طریق اشتراک دریافت کرده‌اید، اکنون برای دسترسی رایگان به بستهٔ بازی، باید اشتراک فعال بازی را داشته باشید.",
                        style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:27},
                    },
                    {
                        text:"میتوانید با پرداخت سکه، برای همیشه  بستهٔ بازی را فعال کرده و بدون اشتراک به بازی دسترسی داشته باشید.",
                        style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:27},
                    },
                ]
                AlertBottomDrawerHelper.showAlert({
                    title:"مدیریت اشتراک",
                    message: msg,
                    buttons:btn,
                    options:{
                        cancelable: true,
                        icon:{
                            Icon:()=>(
                                <LocalImageComponent
                                    path={require("../../../assets/image/diamond.png")}
                                    width={100}
                                    height={100}
                                    resizeMode={'stretch'}
                                    blank_background={true}
                                />
                            )
                        }
                    }
                })
            } else {
                navigate("StartPackageGame", {_id:_id.toHexString(), packageId:packageId.toHexString()})
            }
        } else {
            navigate("PackageInformation", {_id:packageId.toHexString()})
        }
    }
    const packageInfo = ()=>{
        navigate("PackageInformation", {_id:packageId.toHexString()})
    }
    return (
        <View style={{alignItems:'center', justifyContent:'center'}}>
            <TouchableOpacity onPress={packageInfo} activeOpacity={0.9}>
                <ImageBackground
                    source={require("../../../assets/image/thick_rectangle_card.png")}
                    style={{ width: width - 50, height: 190, paddingBottom:2, justifyContent:'space-between'}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View>
                        <View style={{width:"100%", flexDirection:'row', gap:5, alignItems:'center', justifyContent:'flex-start', paddingHorizontal:10, paddingVertical:10}}>
                            <View style={{width:95, height:95, alignItems:'center', justifyContent:'center', backgroundColor:colors.border.a1, borderRadius:15, borderWidth:2, borderColor:colors.primary.a3}}>
                                {
                                    image?
                                    <ImageComponent
                                        uri={image}
                                        width={91}
                                        height={91}
                                        resizeMode="cover"
                                        borderRadius={13}
                                    />
                                    :
                                    <Icon name={'camera-off'} type={'Feather'} style={{fontSize:40, color:colors.text.a5}}/>
                                }
                            </View>
                            <View style={{flexDirection:'column', alignItems:'flex-start', height:'100%', justifyContent:'space-between', height:95}}>
                                <View>
                                    <Text numberOfLines={2} style={{fontFamily:Font.black, color:colors.primary.a3, fontSize:16, maxWidth:width-170}}>{title}</Text>
                                    <Text numberOfLines={1} style={{fontFamily:Font.medium, color:colors.text.a2, fontSize:11}}>{`${numberSeason} فصل  -  ${numberStage} مرحله`}</Text>
                                </View>
                                <WoodProgressBar
                                        progressWidth={IS_TABLET_CONDITION?190:width-170}
                                        progress={progress}
                                        maxValue={numberStage}
                                        showValue={true}
                                    />
                            </View>
                        </View>
                        <View style={{width:"100%", flexDirection:'row', alignItems:'center', justifyContent:'flex-start', gap:5, paddingHorizontal:10}}>
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
                            {accessTypeText&&<Text numberOfLines={1} style={{fontFamily:Font.medium, color:colors.text.a5, fontSize:10}}>{accessTypeText}</Text>}
                        </View>
                    </View>
                    <View style={{width:"100%", flexDirection:'row', alignItems:'flex-end', justifyContent:endedGame == true?'space-between':'flex-end', paddingHorizontal:10}}>
                        {
                            endedGame == true&&
                            <View style={{alignItems:'center', bottom:8}}>
                                <LocalImageComponent
                                    path={require('../../../assets/image/cup.png')}
                                    width={40}
                                    height={40}
                                    resizeMode={'cover'}
                                    blank_background={true}
                                />
                                <Text style={{ color: "#86442d", fontFamily: Font.iran_yekan_black_fa, fontSize:9, position:'absolute', top:2 }}>{"پایان"}</Text>
                            </View>
                        }
                        <TouchableOpacity onPress={startGame} activeOpacity={0.8} style={{ bottom:-15}}>
                            <ImageBackground
                                source={require("../../../assets/image/wood_blue_button.png")}
                                style={{ width: IS_TABLET_CONDITION?180:140, height: IS_TABLET_CONDITION?70:54, alignItems:'center', justifyContent:'center', paddingBottom:5}}
                                imageStyle={{ resizeMode: "stretch" }}
                                resizeMode="stretch"
                            >
                                <Text style={{fontFamily:Font.iran_yekan_black_fa, fontSize:14, color:colors.primary.a3}}>{contentCompleted==true?'شروع بازی':'بارگیری محتوا'}</Text>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </View>
    );
};
export default memo(UserPackageItem)