import React, {useEffect, useCallback, useRef, useState} from 'react';
import {StyleSheet, View, Dimensions, ScrollView, ImageBackground, Text, Linking, AppState, NativeModules} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import SimpleItem from '../../../components/list-view-items/SimpleItem';
import LocalImageComponent from '../../../components/image-components/LocalImageComponent';
import Globals from '../../../utils/Globals';
import { TapsellLegacyAdapter } from '@react-native-tapsell-mediation/legacy';
import { CompletionState, requestRewardedAd, showRewardedAd } from '@react-native-tapsell-mediation/tapsell';
import FullScreenLoadingHelper from '../../../components/full-screen-loading/FullScreenLoadingHelper';
import { tapsell } from '../../../utils/constants/tapsell';
import { showToast } from '../../../components/custom-toast/ToastRef';
import AlertBottomDrawerHelper from '../../../components/alert-bottom-drawer/AlertBottomDrawerHelper';
import { increaseNumberCoins } from '../../../redux/slices/coinSlice';
import { TARGET_STORE } from '../../../utils/constants/build-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WaveIndicator } from 'react-native-indicators';
import * as Progress from 'react-native-progress';
import BackgroundTimer from 'react-native-background-timer';
import axios from 'axios';
import { getRewardAdsStatus, registerRewardAdWatch } from '../../../utils/adsLimitStorage';
import { STATUS_BAR_HEIGHT } from '../../../utils/constants/constants';
import TimerUIThread from '../../../components/timer/TimerUIThread';

const {CafeBazaar, Myket, ImmersiveMode} = NativeModules;
function FreeCoin(props){
    const { width, height } = ImmersiveMode.isImmersiveModeActive()? Dimensions.get('screen'):Dimensions.get('window');
    const dispatch = useDispatch();
    const colors = useAppTheme()
    const [adsStatus, setAdsStatus] = useState(null)
    const { loginType } = useSelector((state) => state.account);
    const { free_coin_completed_account_info, free_coin_follow_instagram, free_coin_join_telegram, free_coin_view_ads, free_coin_first_rating_in_store } = useSelector((state) => state.constants);
    const appState = useRef(AppState.currentState);
    const wentToInstagram = useRef(false);
    const wentToTelegram = useRef(false);
    const wentToStore = useRef(false);
    const permissionInstagramCoin = useRef(false)
    const permissionTelegramCoin = useRef(false)
    const permissionStoreCoin = useRef(false)
    const allowedFields = [
        'follow_instagram',
        'joined_telegram',
        'rated_in_store'
    ];

    useEffect(()=>{
        checkAds()
        TapsellLegacyAdapter.register();
    }, [])
    const checkAds = async () => {
        const adsStatus = await getRewardAdsStatus();
        setAdsStatus(adsStatus)
    };

    useEffect(() => {
        const subscription = AppState.addEventListener(
            'change',
            nextAppState => {
                if (
                    appState.current.match(/inactive|background/) &&
                    nextAppState === 'active'
                ) {
                    if (wentToInstagram.current) {
                        wentToInstagram.current = false;
                        operationInstagramFollow()
                    } else if(wentToTelegram.current) {
                        wentToTelegram.current = false;
                        operationTelegramJoining()
                    } else if(wentToStore.current) {
                        wentToStore.current = false;
                        operationRating()
                    }
                }

                appState.current = nextAppState;
            }
        );

        return () => subscription.remove();
    }, []);

    const requestShowAd = async () => {
        const adsStatus = await getRewardAdsStatus();
        if(adsStatus.allowed == true){
            FullScreenLoadingHelper.showLoading({
                title: "در حال بارگذاری...",
                cancelable: false
            })
            const ZONE_ID = tapsell.position.get_free_coin.zone_id;
            await requestRewardedAd(ZONE_ID).then((id) => {
                showRewardedAdCallBack(id);
            }).catch((e)=>{
                showToast({
                    title: `مشکلی پیش آمد`,
                    message: "مشکلی در بارگذاری ویدیو پیش آمد. اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.",
                    type: "error",
                    animationType: "slide",
                    position: "top",
                    duration: 5000
                });
                FullScreenLoadingHelper.hideLoading()
            })
        } else {
            showToast({
                title: `مشکلی پیش آمد`,
                message: "در حال حاضر نمایش ویدیو محدود شده است.",
                type: "error",
                animationType: "slide",
                position: "top",
                duration: 5000
            });
        }
    };
    const showRewardedAdCallBack = useCallback((id) => {
        FullScreenLoadingHelper.hideLoading()
        if (!id) {
            const msg = [
                {
                    text:"مشکلی در بارگذاری ویدیو پیش آمد. اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.",
                    style:{ width:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'center', textAlign:'center', lineHeight:24},
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
                dispatch(increaseNumberCoins({number:free_coin_view_ads}))
                registerLocalHistoryAds()
                const msg = [
                    {
                        text:`تعداد ${free_coin_view_ads} سکه با موفقیت به حساب کاربری شما اضافه شد.`,
                        style:{ width:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'center', textAlign:'center', lineHeight:24},
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
                                <View style={{width:width, alignItems:'center'}}>
                                    <LocalImageComponent
                                        path={require('../../../assets/image/coin.png')}
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
            onAdClosed: (completionState) => {
                if(CompletionState[completionState] == "SKIPPED"){
                    const msg = [
                        {
                            text:"برای دریافت سکه، باید ویدیو را تا انتها تماشا کنید.",
                            style:{ width:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'center', textAlign:'center', lineHeight:24},
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
                        style:{ width:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'center', textAlign:'center', lineHeight:24},
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
    const registerLocalHistoryAds = async()=>{
        const updatedStatus = await registerRewardAdWatch();
        setAdsStatus(updatedStatus);
    }

    const coinComponent = (value)=>(
        <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
            {
                value&&
                <Text style={{fontFamily:Font.black, color:colors.primary.a3, fontSize:14}}>{value}</Text>
            }
            <LocalImageComponent
                path={require("../../../assets/image/coin.png")}
                width={20}
                height={20}
                resizeMode="stretch"
                blank_background
            />
        </View>
    )

    const coinAdsComponent = (value)=>(
        <View style={{flexDirection:'row', alignItems:'center'}}>
            {
                adsStatus?.allowed === false?
                <TimerUIThread
                    style={{fontSize: 14, fontFamily: Font.black, color: colors.primary.a3}}
                    titleStyle={{fontFamily: Font.medium, color: `${colors.primary.a3}99`}}
                    seconds={adsStatus.seconds}
                    minutes={adsStatus.minutes}
                    hours={adsStatus.hours}
                />
                :
                <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                    {
                        value&&
                        <Text style={{fontFamily:Font.black, color:colors.primary.a3, fontSize:14}}>{value}</Text>
                    }
                    <LocalImageComponent
                        path={require("../../../assets/image/coin.png")}
                        width={20}
                        height={20}
                        resizeMode="stretch"
                        blank_background
                    />
                </View>
            }
            
        </View>
    )
    
    const setRaiting = ()=>{
        if(TARGET_STORE == "cafebazaar"){
            handleCafeBazaarRating()
        } else if(TARGET_STORE == "myket"){
            handleMyketRating()
        }
    }
    const handleCafeBazaarRating = async () => {
        try {
            const success = await CafeBazaar.openRating();
            if (success) {
                wentToStore.current = true
                wentToInstagram.current = false;
                wentToTelegram.current = false;
            }
        } catch (error) {
            showToast({
                title: `مشکلی پیش آمد`,
                message: "خطایی در باز کردن کافه‌ بازار پیش آمد. یا اینکه کافه بازار نصب نیست.",
                type: "error",
                animationType: "slide",
                position: "top",
                duration: 4000
            });
        }
    };
    const handleMyketRating = async () => {
        try {
            const success = await Myket.openRating();
            if (success) {
                wentToStore.current = true
                wentToInstagram.current = false;
                wentToTelegram.current = false;
            }
        } catch (error) {
            if (error.code === 'E_MYKET_NOT_INSTALLED') {
                showToast({
                    title: `مشکلی پیش آمد`,
                    message: "تا زمانی که مایکت نصب نباشد ثبت نظر و امتیاز ممکن نیست.",
                    type: "error",
                    animationType: "slide",
                    position: "top",
                    duration: 4000
                });
            } else {
                showToast({
                    title: `مشکلی پیش آمد`,
                    message: "خطایی در باز کردن مایکت پیش آمد.",
                    type: "error",
                    animationType: "slide",
                    position: "top",
                    duration: 4000
                });
            }
        }
    };
    const operationRating = ()=>{
        const type = allowedFields[2]
        checkPermissionAllowedFields(type)
        const msg = [
            {
                text:`آیا به ${Globals.game_name_fa} امتیاز دادید؟`,
                style:{ maxWidth:width-65, fontFamily:Font.bold, fontSize:16, color:colors.alert.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
            },
            {
                text:"* اگر امتیاز ثبت نکردید، برای دریافت سکه دوباره تلاش کنید.",
                style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:12, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
            },
            {
                text:"* اگر امتیاز ثبت کردید، برای دریافت سکه لطفا کمی منتظر بمانید.",
                style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:12, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
            },
        ]
        AlertBottomDrawerHelper.showAlert({
            title:`${Globals.game_name_fa} در فروشگاه`,
            message: msg,
            buttons:[
                {
                    onPress : ()=>{
                        setRaiting()
                    },
                    text: "تلاش دوباره",
                    loading: false,
                    stayOpen: false,
                    type: "bold",
                },
                {
                    onPress : ()=>{},
                    text: "لغو ثبت امتیاز",
                    loading: false,
                    stayOpen: false,
                    type: "border",
                },
            ],
            options:{
                cancelable: false,
                icon:{
                    Icon:()=>(
                        <TimerComponent
                            iconName={"star-half-alt"}
                            iconType={"FontAwesome5"}
                            color={colors.primary.a5}
                            endTime={()=>{
                                if(permissionStoreCoin.current == true){
                                    applyFreeCoinAllowedFields(type)
                                } else {
                                    AlertBottomDrawerHelper.hideAlert()
                                }
                            }}
                        />
                    )
                }
            }
        })
    }
    ///////////////////////////////////////////////////////////////////////////////////
    const followInstagram = async ()=>{
        wentToInstagram.current = true;
        wentToTelegram.current = false;
        wentToStore.current = false
        await Linking.openURL(Globals.instagram_page_url)
    }
    const operationInstagramFollow = ()=>{
        const type = allowedFields[0]
        checkPermissionAllowedFields(type)
        const msg = [
            {
                text:`آیا صفحهٔ اینستاگرام ${Globals.game_name_fa} را دنبال کردید؟`,
                style:{ maxWidth:width-65, fontFamily:Font.bold, fontSize:16, color:colors.alert.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
            },
            {
                text:"* اگر صفحهٔ اینستاگرام را دنبال نکردید، برای دریافت سکه دوباره تلاش کنید.",
                style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:12, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
            },
            {
                text:"* اگر صفحهٔ اینستاگرام را دنبال کردید، برای دریافت سکه لطفا کمی منتظر بمانید.",
                style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:12, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
            },
        ]
        AlertBottomDrawerHelper.showAlert({
            title:`صفحهٔ اینستاگرام ${Globals.game_name_fa}`,
            message: msg,
            buttons:[
                {
                    onPress : ()=>{
                        followInstagram()
                    },
                    text: "تلاش دوباره",
                    loading: false,
                    stayOpen: false,
                    type: "bold",
                },
                {
                    onPress : ()=>{},
                    text: "لغو دنبال کردن",
                    loading: false,
                    stayOpen: false,
                    type: "border",
                },
            ],
            options:{
                cancelable: false,
                icon:{
                    Icon:()=>(
                        <TimerComponent
                            iconName={"instagram"}
                            iconType={"FontAwesome5"}
                            color={"#E1306C"}
                            endTime={()=>{
                                if(permissionInstagramCoin.current == true){
                                    applyFreeCoinAllowedFields(type)
                                } else {
                                    AlertBottomDrawerHelper.hideAlert()
                                }
                            }}
                        />
                    )
                }
            }
        })
    }
    ///////////////////////////////////////////////////////////////////////////////////
    const joinToTelegram = async ()=>{
        wentToTelegram.current = true;
        wentToInstagram.current = false;
        wentToStore.current = false
        await Linking.openURL(Globals.telegram_channel_url)
    }
    const operationTelegramJoining = ()=>{
        const type = allowedFields[1]
        checkPermissionAllowedFields(type)
        const msg = [
            {
                text:`آیا در کانال تلگرام ${Globals.game_name_fa} عضو شدید؟`,
                style:{ maxWidth:width-65, fontFamily:Font.bold, fontSize:16, color:colors.alert.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
            },
            {
                text:"* اگر در کانال تلگرام عضو نشدید، برای دریافت سکه دوباره تلاش کنید.",
                style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:12, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
            },
            {
                text:"* اگر در کانال تلگرام عضو شدید، برای دریافت سکه لطفا کمی منتظر بمانید.",
                style:{ maxWidth:width-30, fontFamily:Font.medium, fontSize:12, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
            },
        ]
        AlertBottomDrawerHelper.showAlert({
            title:`کانال تلگرام ${Globals.game_name_fa}`,
            message: msg,
            buttons:[
                {
                    onPress : ()=>{
                        joinToTelegram()
                    },
                    text: "تلاش دوباره",
                    loading: false,
                    stayOpen: false,
                    type: "bold",
                },
                {
                    onPress : ()=>{},
                    text: "لغو عضویت",
                    loading: false,
                    stayOpen: false,
                    type: "border",
                },
            ],
            options:{
                cancelable: false,
                icon:{
                    Icon:()=>(
                        <TimerComponent
                            iconName={"telegram-plane"}
                            iconType={"FontAwesome5"}
                            color={"#24A1DE"}
                            endTime={()=>{
                                if(permissionTelegramCoin.current == true){
                                    applyFreeCoinAllowedFields(type)
                                } else {
                                    AlertBottomDrawerHelper.hideAlert()
                                }
                            }}
                        />
                    )
                }
            }
        })
    }
    ///////////////////////////////////////////////////////////////////////////////////
    const checkPermissionAllowedFields = async(type)=>{
        const storage = await AsyncStorage.getItem(type)
        if(storage === "1"){
            if(type == allowedFields[0]){
                permissionInstagramCoin.current = false;
            } else if(type == allowedFields[1]){
                permissionTelegramCoin.current = false;
            } else if(type == allowedFields[2]){
                permissionStoreCoin.current = false;
            }
            setTimeout(()=>{
                AlertBottomDrawerHelper.hideAlert()
                showToast({
                    title: `مشکلی پیش آمد`,
                    message: 'از این آیتم، شما قبلا سکه دریافت کرده‌اید.',
                    type: "error",
                    animationType: "slide",
                    position: "top",
                    duration: 5000
                });
            }, 4000)
        } else {
            let data = {
                query : `
                    query checkPermissionToGiveFreeCoin($type : String!){
                        checkPermissionToGiveFreeCoin(type : $type) {
                            status,
                        }
                    }
                `,
                variables : {
                    "type" : type,
                }
            }
            await axios({
                url:'/',
                method:'post',
                data: data,
            }).then(async(response)=>{
                const data = response.data?.data?.checkPermissionToGiveFreeCoin
                if(data?.status == 200){
                    if(type == allowedFields[0]){
                        permissionInstagramCoin.current = true;
                    } else if(type == allowedFields[1]){
                        permissionTelegramCoin.current = true;
                    } else if(type == allowedFields[2]){
                        permissionStoreCoin.current = true;
                    }
                } else {
                    if(type == allowedFields[0]){
                        permissionInstagramCoin.current = false;
                    } else if(type == allowedFields[1]){
                        permissionTelegramCoin.current = false;
                    } else if(type == allowedFields[2]){
                        permissionStoreCoin.current = false;
                    }
                    setTimeout(()=>{
                        AlertBottomDrawerHelper.hideAlert()
                        showToast({
                            title: `مشکلی پیش آمد`,
                            message: response?.data?.errors[0]?.data[0]?.message??"در حال حاضر امکان دریافت سکه از این آیتم وجود ندارد.",
                            type: "error",
                            animationType: "slide",
                            position: "top",
                            duration: 5000
                        });
                    }, 4000)
                    if(response?.data?.errors[0]?.data[0]?.get_previous == true){
                        await AsyncStorage.setItem(type, "1")
                    }
                }
            }).catch((error)=>{
                if(type == allowedFields[0]){
                    permissionInstagramCoin.current = false;
                } else if(type == allowedFields[1]){
                    permissionTelegramCoin.current = false;
                } else if(type == allowedFields[2]){
                    permissionStoreCoin.current = false;
                }
            })
        }
    }
    const applyFreeCoinAllowedFields = async(type)=>{
        let data = {
            query : `
                mutation applyFreeCoinAllowedFieldsForUser($type : String!){
                    applyFreeCoinAllowedFieldsForUser(type : $type) {
                        status,
                    }
                }
            `,
            variables : {
                "type" : type,
            }
        }
        await axios({
            url:'/',
            method:'post',
            data: data,
        }).then(async(response)=>{
            const data = response.data?.data?.applyFreeCoinAllowedFieldsForUser
            if(data?.status == 200){
                await AsyncStorage.setItem(type, "1")
                AlertBottomDrawerHelper.hideAlert()
                const numberFreeCoin = type == allowedFields[0]?free_coin_follow_instagram:type == allowedFields[1]?free_coin_join_telegram:type == allowedFields[2]?free_coin_first_rating_in_store:0
                dispatch(increaseNumberCoins({number:numberFreeCoin}))
                const msg = [
                    {
                        text:`تعداد ${numberFreeCoin} سکه با موفقیت به حساب کاربری شما اضافه شد.`,
                        style:{ width:width-30, fontFamily:Font.medium, fontSize:14, color:colors.text.a2, alignSelf:'center', textAlign:'center', lineHeight:24},
                    }
                ]
                setTimeout(()=>{
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
                                    <View style={{width:width, alignItems:'center'}}>
                                        <LocalImageComponent
                                            path={require('../../../assets/image/coin.png')}
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
                }, 700)
            } else {
                AlertBottomDrawerHelper.hideAlert()
            }
        }).catch((error)=>{
            AlertBottomDrawerHelper.hideAlert()
        })
    }
    return(
        <View style={{flex:1, backgroundColor:colors.background.a2, paddingTop:ImmersiveMode.isImmersiveModeActive()?STATUS_BAR_HEIGHT:0}}>
            <GeneralHeader
                coin={true}
                back={true}
                title={"دریافت سکه رایگان"}
            />
            <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor:colors.background.a1}}>
                <ImageBackground
                    source={require("../../../assets/image/menu_frame_full.png")}
                    style={{ width: width - 20, height:ImmersiveMode.isImmersiveModeActive()?height-(80 + STATUS_BAR_HEIGHT):height-80, paddingVertical:"3.5%"}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{borderRadius:"10%", overflow:'hidden', width:width-40, alignItems:'center', alignSelf:'center'}}>
                        <ScrollView 
                            contentContainerStyle={{alignItems:'center', paddingVertical:5, gap:10}} 
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={{width:"100%", backgroundColor:`#00000050`, paddingVertical:5, borderRadius:20, alignItems:'center', marginTop:5}}>
                                <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a4}}>{"دائمی"}</Text>
                            </View>
                            <SimpleItem
                                title={"نمایش ویدیو"}
                                arrow={false}
                                icon_name={"video"}
                                icon_type={"Entypo"}
                                icon_size={25}
                                icon_color={colors.alert.a2}
                                click={requestShowAd}
                                ValueComponent={()=>coinAdsComponent(free_coin_view_ads)}
                            />
                            <View style={{width:"100%",  backgroundColor:`#00000050`, paddingVertical:5, borderRadius:20, alignItems:'center', marginTop:30}}>
                                <Text style={{fontFamily:Font.medium, fontSize:12, color:colors.text.a4}}>{"فقط یکبار"}</Text>
                            </View>
                            <SimpleItem
                                title={"تکمیل اطلاعات حساب"}
                                arrow={false}
                                icon_name={"person"}
                                icon_type={"Ionicons"}
                                icon_size={25}
                                icon_color={colors.primary.a3}
                                click={()=>{
                                    if(loginType == "registered"){
                                        props.navigation.navigate("AccountManagement")
                                    } else {
                                        props.navigation.navigate("LoginToAccount")
                                        showToast({
                                            title: `ورود به حساب`,
                                            message: "قبل از تکمیل اطلاعات، ابتدا باید وارد حساب کاربری خود شوید.",
                                            type: "info",
                                            animationType: "slide",
                                            position: "top",
                                            duration: 5000
                                        });
                                    }
                                }}
                                ValueComponent={()=>coinComponent(free_coin_completed_account_info)}
                            />
                            <SimpleItem
                                title={"دنبال کردن اینستاگرام"}
                                arrow={false}
                                icon_name={"instagram"}
                                icon_type={"FontAwesome5"}
                                icon_color={"#E1306C"}
                                icon_size={25}
                                click={followInstagram}
                                ValueComponent={()=>coinComponent(free_coin_follow_instagram)}
                            />
                            <SimpleItem
                                title={"پیوستن به کانال تلگرام"}
                                arrow={false}
                                icon_name={"telegram-plane"}
                                icon_type={"FontAwesome5"}
                                icon_color={"#24A1DE"}
                                icon_size={25}
                                click={joinToTelegram}
                                ValueComponent={()=>coinComponent(free_coin_join_telegram)}
                            />
                            <SimpleItem
                                title={"ثبت امتیاز و نظر به بازی"}
                                arrow={false}
                                icon_name={"star-half-alt"}
                                icon_type={"FontAwesome5"}
                                icon_size={25}
                                icon_color={colors.primary.a5}
                                click={setRaiting}
                                ValueComponent={()=>coinComponent(free_coin_first_rating_in_store)}
                            />
                        </ScrollView>
                    </View>
                </ImageBackground>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
    },
});

const TimerComponent = ({iconName, iconType, color, endTime}) => {
    const colors = useAppTheme()
    const time = 30
    const [second, setSecond] = useState(time);

    useEffect(() => {
        const id = BackgroundTimer.setInterval(() => {
            setSecond(prev => {
                if(prev > 0){
                    return prev - 1;
                } else {
                    endTime()
                    BackgroundTimer.clearInterval(id);
                    return 0;
                }
            });
        }, 1000);
        return () => {
            BackgroundTimer.clearInterval(id);
        };
    }, []);

    return (
        <View style={{ width, alignItems: 'center' }}>
            <View style={{width: 120, height: 120, alignItems: 'center', justifyContent: 'center'}}>
                <Icon name={iconName} type={iconType} style={{ fontSize: 50, color }}/>
                <View style={{position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                    <WaveIndicator
                        color={color}
                        size={160}
                        count={2}
                        waveMode="fill"
                    />
                </View>
                <View style={{ position: 'absolute' }}>
                    <Progress.Circle
                        progress={(((time-second)*100)/time)/100}
                        size={100}
                        thickness={4}
                        color={colors.primary.a3}
                        borderWidth={1}
                        borderColor={colors.alert.a1}
                    />
                </View>
            </View>
            <Text style={{fontFamily: Font.black, color: colors.primary.a3, fontSize: 25}}>{String(second).padStart(2, '0')}</Text>
            <Text style={{fontFamily: Font.medium, color: `${colors.primary.a3}99`, fontSize: 12}}>{"در حال بررسی..."}</Text>
        </View>
    );
};

export default FreeCoin;