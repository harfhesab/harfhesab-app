import React, {useEffect, useCallback} from 'react';
import {StyleSheet, View, Dimensions, ScrollView, ImageBackground, Text, Linking} from 'react-native';
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


function FreeCoin(props){
    const dispatch = useDispatch();
    const { width, height } = Dimensions.get('window');
    const colors = useAppTheme()
    const { free_coin_completed_account_info, free_coin_follow_instagram, free_coin_View_ads, free_coin_first_rating_in_store } = useSelector((state) => state.constants);

    useEffect(()=>{
        TapsellLegacyAdapter.register();
    }, [])

    const requestShowAd = async () => {
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
                message: "مشکلی در بارگذاری ویدیو پیش آمد. اتصال اینترنت خود دار بررسی کرده و دوباره تلاش کنید.",
                type: "error",
                animationType: "slide",
                position: "top",
                duration: 5000
            });
            FullScreenLoadingHelper.hideLoading()
        })
    };
    const showRewardedAdCallBack = useCallback((id) => {
        FullScreenLoadingHelper.hideLoading()
        if (!id) {
            const msg = [
                {
                    text:"مشکلی در بارگذاری ویدیو پیش آمد. اتصال اینترنت خود دار بررسی کرده و دوباره تلاش کنید.",
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
                dispatch(increaseNumberCoins({number:free_coin_View_ads}))
                const msg = [
                    {
                        text:`تعداد ${free_coin_View_ads} سکه با موفقیت به حساب کاربری شما اضافه شد.`,
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
                        text:"مشکلی در بارگذاری ویدیو پیش آمد. اتصال اینترنت خود دار بررسی کرده و دوباره تلاش کنید.",
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
    
    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                coin={true}
                back={true}
                title={"دریافت سکه رایگان"}
            />
            <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                <ImageBackground
                    source={require("../../../assets/image/menu_frame_full.png")}
                    style={{ width: width - 20, height:height-80, paddingVertical:"3.5%"}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{borderRadius:"10%", overflow:'hidden', width:width-40, alignItems:'center', alignSelf:'center'}}>
                        <ScrollView 
                            contentContainerStyle={{alignItems:'center', paddingVertical:5, gap:10}} 
                            showsVerticalScrollIndicator={false}
                        >
                            <SimpleItem
                                title={"تکمیل اطلاعات حساب"}
                                arrow={false}
                                icon_name={"person"}
                                icon_type={"Ionicons"}
                                icon_size={25}
                                click={()=>{props.navigation.navigate("AccountManagement")}}
                                ValueComponent={()=>coinComponent(free_coin_completed_account_info)}
                            />
                            <SimpleItem
                                title={"مشاهده تبلیغ"}
                                arrow={false}
                                icon_name={"video"}
                                icon_type={"Entypo"}
                                icon_size={25}
                                click={requestShowAd}
                                ValueComponent={()=>coinComponent(free_coin_View_ads)}
                            />
                            <SimpleItem
                                title={"دنبال کردن اینستاگرام"}
                                arrow={false}
                                icon_name={"instagram"}
                                icon_type={"Entypo"}
                                icon_size={25}
                                click={()=>{Linking.openURL(Globals.instagram_page_url)}}
                                ValueComponent={()=>coinComponent(free_coin_follow_instagram)}
                            />
                            <SimpleItem
                                title={"ثبت بازخورد از بازی"}
                                arrow={false}
                                icon_name={"star-half-alt"}
                                icon_type={"FontAwesome5"}
                                icon_size={25}
                                click={()=>{}}
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

export default FreeCoin;