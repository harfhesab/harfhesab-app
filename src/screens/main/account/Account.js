import React, {useState, useEffect} from 'react';
import {StyleSheet, View, Text, Dimensions, TouchableOpacity, SafeAreaView, ScrollView, TouchableNativeFeedback, ImageBackground} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store/RootReducer';
import { login, logout } from '../../../redux/slices/accountSlice';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import SimpleItem from '../../../components/list-view-items/SimpleItem';
import Border from '../../../components/Border';
import ButtonGradient from '../../../components/buttons/ButtonGradient';
import LinearGradient from 'react-native-linear-gradient';
import SimpleBorderText from '../../../components/text-components/SimpleBorderText';
import AlertBottomDrawerHelper from '../../../components/alert-bottom-drawer/AlertBottomDrawerHelper';
import { useRealm } from '../../../realm';
import { persistor, store } from '../../../redux/store/Store';
import axios from 'axios';
import { showToast } from '../../../components/custom-toast/ToastRef';
import LocalImageComponent from '../../../components/image-components/LocalImageComponent';

const {width, height} = Dimensions.get("window")
function Account(props){
    const colors = useAppTheme()
    const realm = useRealm();
    const { loginType, name, phone, newNotifications } = useSelector((state) => state.account);
    const { activeSubscription } = useSelector((state) => state.subscription);
    const { numberCoins } = useSelector((state) => state.coins);

    const AccountOptions = [
        {
            title: "خرید سکه",
            image_icon: require('../../../assets/image/coin.png'),
            icon_size: 35,
            arrow: true,
            onPress:()=>{props.navigation.navigate("CoinPlans")},
            is_visible:true
        },
        {
            title: "اشتراک بازی",
            image_icon: require('../../../assets/image/diamond.png'),
            icon_size: 35,
            arrow: true,
            onPress:()=>{props.navigation.navigate("SubscriptionPlans")},
            is_visible:true
        },
        {
            title: "بسته‌های بازی من",
            image_icon: require('../../../assets/image/my-package.png'),
            icon_size: 30,
            arrow: true,
            onPress:()=>{props.navigation.navigate("UserPackagesList")},
            is_visible:true
        },
        {
            title: "دریافت سکه رایگان",
            image_icon: require('../../../assets/image/coin.png'),
            icon_size: 35,
            arrow: true,
            onPress:()=>{props.navigation.navigate("FreeCoin")},
            is_visible:true
        },
        {
            title: "بروزرسانی بازی مرحله‌ای",
            image_icon: require('../../../assets/image/download.png'),
            icon_size: 25,
            image_width: 18,
            arrow: true,
            onPress:()=>{props.navigation.navigate("StageGameUpdateScreen")},
            is_visible:true
        },
        {
            title: "اعلانات",
            icon_name: "bell",
            icon_type: "MaterialCommunityIcons",
            icon_size: 30,
            arrow: true,
            onPress:()=>{props.navigation.navigate("Notification")},
            is_visible:true,
            value:(newNotifications && newNotifications > 0)?newNotifications:null
        },
        {
            title: "پیام‌ها",
            icon_name: "mail",
            icon_type: "MaterialCommunityIcons",
            icon_size: 30,
            arrow: true,
            onPress:()=>{props.navigation.navigate("MessageInApp")},
            is_visible:true,
        },
        {
            title: "تنظیمات",
            image_icon: require('../../../assets/image/setting_yellow.png'),
            arrow: true,
            onPress:()=>{props.navigation.navigate("Setting")},
            is_visible:true
        },
        {
            title: "خروج از حساب کاربری",
            title_color: colors.alert.a2,
            icon_name: "sign-out-alt",
            icon_type: "FontAwesome5",
            icon_color: colors.alert.a2,
            arrow: false,
            onPress:()=>{logoutAlert()},
            is_visible:loginType == "registered"?true:false
        }
    ]

    const logoutAlert = ()=>{
        const btn = [
            {
                onPress : ()=>{
                    logoutOperation()
                },
                text: "خروج از حساب",
                loading: true,
                stayOpen: true,
                type: "bold",
            },
            {
                onPress : ()=>{},
                text: "لغو",
                loading: false,
                type: "border",
            },
        ]
        const msg = [
            {
                text:"آیا از حسابتان خارج می‌شوید؟",
                style:{ maxWidth:width-65, fontFamily:Font.bakh_bold, fontSize:20, color:colors.alert.a1, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
            },
            {
                text:"توجه کنید برای ذخیره‌ی آخرین اطلاعات بازی روی حساب کاربری، از اتصال دستگاه خود به اینترنت مطمئن شوید تا همه‌ی اطلاعات، روی حسابتان ذخیره شود.",
                style:{ maxWidth:width-30, fontFamily:Font.bakh_semi_bold, fontSize:12, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
            },
            {
                text:"لازم به ذکر است، اگر در آخرین مرحله از بازی‌ها، چه در بازی مرحله‌ای و چه در بسته‌های بازی، چنانچه دستگاهتان به اینترنت دسترسی نداشته است، ممکن است ذخیره‌ی روند پیشرفت بازی هایتان به درستی انجام نشده باشد.",
                style:{ maxWidth:width-30, fontFamily:Font.bakh_semi_bold, fontSize:12, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:25},
            }
        ]
        AlertBottomDrawerHelper.showAlert({
            title:"خروج از حساب کاربری",
            message: msg,
            buttons:btn,
            options:{
                cancelable: true,
                icon:{
                    Icon:()=>(
                        <Icon name={"sign-out-alt"} type={"FontAwesome5"} style={{fontSize:75, color:colors.alert.a1}}/>
                    )
                }
            }
        })
    }

    const logoutOperation = async()=>{
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                mutation logOutFromUserAccount(
                        $number_coins : Int,
                    ){
                    logOutFromUserAccount(
                        number_coins : $number_coins
                    ) {
                        status,
                        message
                    }
                }
                `,
                variables : {
                    "number_coins" : numberCoins,
                }
            }
        }).then(async(response)=>{
            const data = response.data.data?.logOutFromUserAccount
            if(data?.status == 200){
                AlertBottomDrawerHelper.hideAlert()
                realm.write(() => {
                    realm.deleteAll();
                });
                await resetReduxStore()
            }
        }).catch((error)=>{
            AlertBottomDrawerHelper.hideAlert()
            showToast({
                title: "خطا در خروج از حساب",
                message: "مشکلی پیش آمد، پس از اطمینان از اتصال دستگاه خود به اینترنت دوباره تلاش کنید.",
                type: "error",
                animationType: "slide",
                position: "top",
                duration:7000
            });
        })
    }

    const resetReduxStore = async () => {
        await persistor.purge();
        store.dispatch({ type: "RESET_APP" });
    };
    
    const account = ()=>{
        return(
            <View style={{width:width, alignItems:'center', paddingVertical:10}}>
                <ImageBackground
                    source={require("../../../assets/image/horizontal_frame2.png")}
                    style={{ width: width - 20, height: 135}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', width:"100%", height:"100%", paddingHorizontal:"6%"}}>
                        <ImageBackground
                                source={require("../../../assets/image/circle_button.png")}
                                style={{ width:100, height: 100, alignItems:'center', justifyContent:'center', paddingBottom:3}}
                                imageStyle={{ resizeMode: "stretch" }}
                                resizeMode="stretch"
                            >
                            <Icon name={"person"} type={"Ionicons"} style={{fontSize:50, color:colors.primary.a3}}/>
                        </ImageBackground>
                        <View style={{flexDirection:'column', alignItems:'flex-end', gap:10}}>
                            <View style={{ flexDirection:'column', alignItems:'flex-end'}}>
                                <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
                                    {
                                        activeSubscription == true&&
                                        <LocalImageComponent
                                            path={require('../../../assets/image/diamond.png')}
                                            width={15}
                                            height={15}
                                            resizeMode="stretch"
                                            blank_background
                                        />
                                    }
                                    <Text style={{fontFamily:Font.en_black, fontSize:15, color:colors.text.a1}}>{name}</Text>
                                </View>
                                <Text style={{fontFamily:Font.bakh_semi_bold, fontSize:12, color:colors.text.a1}}>{loginType == "registered" ? phone : "کاربر میهمان"}</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={()=>{
                                    if(loginType == "registered"){
                                        props.navigation.navigate("AccountManagement")
                                    }else{
                                        props.navigation.navigate("LoginToAccount")
                                    }
                                }} 
                                activeOpacity={0.8} 
                                style={{ alignSelf:'center', justifyContent:'center'}}
                            >
                                <ImageBackground
                                    source={require("../../../assets/image/button_2.png")}
                                    style={{ width: 135, height: 40, alignItems:'center', justifyContent:'center'}}
                                    imageStyle={{ resizeMode: "stretch" }}
                                    resizeMode="stretch"
                                >
                                    <SimpleBorderText
                                        text={loginType == "registered"?"مدیریت حساب":"ورود به حساب"}
                                        width={140}
                                        height={14*1.6}
                                        fontSize={14}
                                        textColor={"#FFFFFF"}
                                        borderColor={"#311b92"}
                                    />
                                </ImageBackground>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        )
    }
    
    return(
        <View style={{flex:1, backgroundColor:colors.background.a1}}>
            <GeneralHeader
                notification={true}
                coin={true}
                subscription={true}
            />
            <View style={{flex:1, alignItems:'center'}}>
                
                {account()}
                <ImageBackground
                    source={require("../../../assets/image/menu_frame.png")}
                    style={{ width: width - 20, height: height-295, paddingVertical:"3.4%"}}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <View style={{borderRadius:"9.8%", overflow:'hidden', width:width-40, alignItems:'center', alignSelf:'center'}}>
                        <ScrollView 
                            contentContainerStyle={{alignItems:'center', paddingVertical:5, gap:10}} 
                            showsVerticalScrollIndicator={false}
                        >
                            
                            {
                                AccountOptions.filter((i)=>i.is_visible == true).map((item, index)=>(
                                    <View key={index.toString()}>
                                        <SimpleItem
                                            title={item.title}
                                            title_color={item?.title_color}
                                            arrow={item.arrow}
                                            icon_name={item?.icon_name}
                                            icon_type={item?.icon_type}
                                            image_icon={item?.image_icon}
                                            icon_size={item.icon_size}
                                            click={item.onPress}
                                            image_width={item?.image_width}
                                            image_height={item?.image_height}
                                            icon_color={item?.icon_color}
                                            value={item?.value??null}
                                        />
                                    </View>
                                ))
                            }
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

export default Account;