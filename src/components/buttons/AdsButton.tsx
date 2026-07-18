import React, {memo, useCallback, useEffect} from 'react';
import {View, TouchableOpacity, Image, ImageBackground, Dimensions} from 'react-native';
import Font from '../../utils/Font';
import { CompletionState, requestRewardedAd, showRewardedAd } from '@react-native-tapsell-mediation/tapsell';
import FullScreenLoadingHelper from '../full-screen-loading/FullScreenLoadingHelper';
import { TapsellLegacyAdapter } from '@react-native-tapsell-mediation/legacy';
import { tapsell, AdsPosition } from '../../utils/constants/tapsell';
import AlertBottomDrawerHelper from '../alert-bottom-drawer/AlertBottomDrawerHelper';
import { useDispatch } from 'react-redux';
import { increaseNumberCoins } from '../../redux/slices/coinSlice';
import LocalImageComponent from '../image-components/LocalImageComponent';
import { colors } from '../../hooks/theme/colors';
import Icon from '../../utils/Icon';
import SimpleBorderText from '../text-components/SimpleBorderText';




interface Props {
    onPress?: any;
    hideAction?: any;
    reward?: number;
    adsPosition?: AdsPosition;
    width?: number;
    height?: number;
    fontSize?: number;
    textColor?: string;
}
const screenWidth = Dimensions.get('window').width;
function AdsButton(
    { onPress, hideAction, reward=7, adsPosition="get_free_coin", width=160, height=55, fontSize=15, textColor="#FFFFFF"}:Props
){
    const dispatch = useDispatch();
    useEffect(()=>{
        TapsellLegacyAdapter.register();
    }, [])

    const click = async () => {
        onPress?.()
        requestShowAd()
    };
    const requestShowAd = async()=>{
        const ZONE_ID = tapsell.position[adsPosition].zone_id;
        FullScreenLoadingHelper.showLoading({
            title: "در حال بارگذاری...",
            cancelable: false
        })
        await requestRewardedAd(ZONE_ID).then((id: string) => {
            showRewardedAdCallBack(id);
        }).catch((e)=>{
            FullScreenLoadingHelper.hideLoading()
            const msg = [
                {
                    text:"مشکلی در بارگذاری ویدیو پیش آمد. اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.",
                    style:{ width:screenWidth-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'center', textAlign:'center', lineHeight:24},
                }
            ]
            AlertBottomDrawerHelper.showAlert({
                title:`دریافت سکه`,
                message: msg,
                buttons:[
                    {
                        onPress : ()=>{},
                        text: "متوجه شدم",
                        loading: false,
                        stayOpen: false,
                        type: "bold",
                    },
                ],
                options:{
                    cancelable: true,
                    icon:{
                        Icon:()=>(
                            <Icon name={"error-outline"} type={"MaterialIcons"} style={{color:colors.alert.a1, fontSize:50}}/>
                        )
                    }
                }
            })
        })
    }
    const showRewardedAdCallBack = useCallback((id:string) => {
        FullScreenLoadingHelper.hideLoading()
        if (!id) {
            const msg = [
                {
                    text:"مشکلی در بارگذاری ویدیو پیش آمد. اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.",
                    style:{ width:screenWidth-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'center', textAlign:'center', lineHeight:24},
                }
            ]
            AlertBottomDrawerHelper.showAlert({
                title:`دریافت سکه`,
                message: msg,
                buttons:[
                    {
                        onPress : ()=>{},
                        text: "متوجه شدم",
                        loading: false,
                        stayOpen: false,
                        type: "bold",
                    },
                ],
                options:{
                    cancelable: true,
                    icon:{
                        Icon:()=>(
                            <Icon name={"error-outline"} type={"MaterialIcons"} style={{color:colors.alert.a1, fontSize:50}}/>
                        )
                    }
                }
            })
            return;
        }
        showRewardedAd(id, {
            onAdImpression: () => {},
            onAdClicked: () => {},
            onRewarded: () => {
                hideAction?.()
                dispatch(increaseNumberCoins({number:reward}))
                const msg = [
                    {
                        text:`تعداد ${reward} سکه با موفقیت به حساب کاربری شما اضافه شد.`,
                        style:{ width:screenWidth-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'center', textAlign:'center', lineHeight:24},
                    }
                ]
                AlertBottomDrawerHelper.showAlert({
                    title:`دریافت سکه`,
                    message: msg,
                    buttons:[
                        {
                            onPress : ()=>{},
                            text: "متوجه شدم",
                            loading: false,
                            stayOpen: false,
                            type: "bold",
                        },
                    ],
                    options:{
                        cancelable: true,
                        icon:{
                            Icon:()=>(
                                <View style={{width:screenWidth, alignItems:'center'}}>
                                    <LocalImageComponent
                                        path={require('../../assets/image/coin.png')}
                                        width={80}
                                        height={80}
                                        resizeMode={'stretch'}
                                        blank_background={true}
                                    />
                                </View>
                            )
                        }
                    }
                })
            },
            onAdClosed: (completionState: CompletionState) => {
                if(CompletionState[completionState] == "SKIPPED"){
                    const msg = [
                        {
                            text:"برای دریافت سکه، باید ویدیو را تا انتها تماشا کنید.",
                            style:{ width:screenWidth-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'center', textAlign:'center', lineHeight:24},
                        }
                    ]
                    AlertBottomDrawerHelper.showAlert({
                        title:`دریافت سکه`,
                        message: msg,
                        buttons:[
                            {
                                onPress : ()=>{},
                                text: "متوجه شدم",
                                loading: false,
                                stayOpen: false,
                                type: "bold",
                            },
                        ],
                        options:{
                            cancelable: true,
                            icon:{
                                Icon:()=>(
                                    <Icon name={"error-outline"} type={"MaterialIcons"} style={{color:colors.alert.a1, fontSize:50}}/>
                                )
                            }
                        }
                    })
                }
            },
            onAdFailed: (error) => {
                const msg = [
                    {
                        text:"مشکلی در بارگذاری ویدیو پیش آمد. اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.",
                        style:{ width:screenWidth-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'center', textAlign:'center', lineHeight:24},
                    }
                ]
                AlertBottomDrawerHelper.showAlert({
                    title:`دریافت سکه`,
                    message: msg,
                    buttons:[
                        {
                            onPress : ()=>{},
                            text: "متوجه شدم",
                            loading: false,
                            stayOpen: false,
                            type: "bold",
                        },
                    ],
                    options:{
                        cancelable: true,
                        icon:{
                            Icon:()=>(
                                <Icon name={"error-outline"} type={"MaterialIcons"} style={{color:colors.alert.a1, fontSize:50}}/>
                            )
                        }
                    }
                })
            },
        });
    }, []);
    return(
        <TouchableOpacity activeOpacity={0.8} onPress={click} style={{width, height, alignItems:'center', justifyContent:'center'}}>
            <ImageBackground
                source={require("../../assets/image/ads_btn_blu.png")}
                style={{ width, height, alignItems:'center', justifyContent:'center', paddingBottom:5 }}
                imageStyle={{ resizeMode: "stretch" }}
                resizeMode="stretch"
            >
                <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', height:"100%", gap:5}}>
                    
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center'}}>
                        <Image
                            style={{width:fontSize, height:fontSize}}
                            source={require('../../assets/image/coin.png')}
                        />
                        <SimpleBorderText
                            text={`${reward} +`}
                            width={30}
                            height={17*1.6}
                            fontSize={17}
                            borderWidth={1.5}
                            textColor={"#fcb900"}
                            borderColor={"#4d2719"}
                        />
                    </View>
                    
                    <SimpleBorderText
                        text={"نمایش ویدیو"}
                        width={95}
                        height={17*1.6}
                        fontSize={17}
                        borderWidth={1.5}
                        textColor={"#fcb900"}
                        borderColor={"#4d2719"}
                    />
                </View>
            </ImageBackground>
        </TouchableOpacity>
    )
}
export default memo(AdsButton);