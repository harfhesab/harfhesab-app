import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
  Modal,
  Linking,
  AppState,
  TouchableOpacity,
} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import { DotIndicator } from 'react-native-indicators';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import ButtonGradient from '../../components/buttons/ButtonGradient';
import InputText from '../../components/inputs/InputText';
import useAppTheme from '../../hooks/theme/useAppTheme';
import DeviceInfo from 'react-native-device-info';
import { useSelector, useDispatch } from 'react-redux';
import Globals from '../../utils/Globals';
import { updateConstantsVersion } from '../../redux/slices/constantsSlice';
import { changeCoinPlansVersion, updateNumberCoins } from '../../redux/slices/coinSlice';
import ButtonBorder from '../../components/buttons/ButtonBorder';
import { loginAsGuest } from '../../redux/slices/accountSlice';
import { createCoinPlansList } from '../../realm/repositories/user/coin-plan-repository';
import { createSubscriptionPlansList } from '../../realm/repositories/user/subscription-plan-repository';
import { changeSubscriptionPlansVersion } from '../../redux/slices/subscriptionSlice';
import { useRealm } from '../../realm';
import { preloadImages } from '../../utils/ImagePreloader';
import { BUILD_TYPE, TARGET_STORE } from '../../utils/constants/build-config';
import { setUserConsent } from '@react-native-tapsell-mediation/tapsell';
import { showToast } from '../../components/custom-toast/ToastRef';
import {
  getMessaging,
  getToken,
  hasPermission,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import AlertBottomDrawerHelper from '../../components/alert-bottom-drawer/AlertBottomDrawerHelper';


const {width, height} = Dimensions.get('window');

// خروجی ممکن است یکی از این‌ها باشد:
// 'granted'         -> دسترسی فعال است
// 'denied'          -> کاربر همین الان دیالوگ سیستمی را رد کرد (یا در حالتی نامعتبر است)، اما دیالوگ سیستمی هنوز در آینده قابل نمایش است
// 'never_ask_again'  -> سیستم دیگر خودش دیالوگ را نشان نمی‌دهد؛ فقط راه دستی (تنظیمات) باقی مانده

async function requestAndroidNotificationPermission() {
    // اندروید زیر 13: اصلاً permission ای برای درخواست وجود ندارد و پیش‌فرض فعال است.
    // طبق تصمیم قبلی، این نسخه‌ها را اصلاً بررسی نمی‌کنیم (اگر کاربر خودش دستی خاموش کرده، تصمیم آگاهانه‌ی خودش بوده).
    if (Platform.Version < 33) {
        return 'granted';
    }
    try {
        const alreadyGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (alreadyGranted) return 'granted';

        // هر بار که این تابع صدا زده شود، دوباره request می‌زنیم.
        // اگر سیستم هنوز مایل به نمایش دیالوگ باشد نشانش می‌دهد؛ در غیر این صورت
        // بدون نمایش هیچ دیالوگی مستقیماً 'never_ask_again' برمی‌گرداند.
        const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return result; // 'granted' | 'denied' | 'never_ask_again'
    } catch (error) {
        console.log('Android Permission Error:', error);
        return 'denied';
    }
}

async function requestIOSNotificationPermission() {
    try {
        const messaging = getMessaging();
        const authStatus = await requestPermission(messaging);
        if (
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL
        ) {
            return 'granted';
        }
        if (authStatus === AuthorizationStatus.DENIED) {
            // در iOS بعد از یک‌بار رد شدن، دیالوگ سیستمی دیگر نشان داده نمی‌شود
            return 'never_ask_again';
        }
        return 'denied';
    } catch (error) {
        console.log('iOS Permission Error:', error);
        return 'denied';
    }
}

async function requestNotificationPermissionStatus() {
    if (Platform.OS === 'android') {
        return requestAndroidNotificationPermission();
    }
    return requestIOSNotificationPermission();
}

// فقط بررسیِ وضعیتِ فعلی، بدون نمایش هیچ دیالوگی (برای استفاده هنگام برگشت از تنظیمات)
async function checkCurrentNotificationPermission() {
    if (Platform.OS === 'android') {
        if (Platform.Version < 33) return true;
        try {
            return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        } catch (error) {
            return false;
        }
    }
    try {
        const messaging = getMessaging();
        // برخلاف requestPermission، این متد هیچ دیالوگی نشان نمی‌دهد و صرفاً وضعیت فعلی را می‌خواند
        const authStatus = await hasPermission(messaging);
        return (
            authStatus === AuthorizationStatus.AUTHORIZED ||
            authStatus === AuthorizationStatus.PROVISIONAL
        );
    } catch (error) {
        return false;
    }
}

function SignIn(props){
    const colors = useAppTheme()
    const dispatch = useDispatch();
    const realm = useRealm();
    const { constants_version } = useSelector((state) => state.constants);
    const { coinPlansVersion } = useSelector((state) => state.coins);
    const { subscriptionPlansVersion } = useSelector((state) => state.subscription);
    const [loading, setLoading] = useState(false)

    // این مودال باید در کل عمر این صفحه (این سشن) فقط یک‌بار نمایش داده شود
    const permissionModalShownRef = useRef(false)
    // اکشنی که کاربر قصد اجرایش را داشت (ورود / ورود مهمان) و باید بعد از بسته‌شدن مودال اجرا شود
    const pendingActionRef = useRef(null)
    const appState = useRef(AppState.currentState)

    useEffect(()=>{
        setUserConsent(true);
    }, [])

    // شنود بازگشت کاربر از صفحه تنظیمات گوشی به اپ (فقط برای ادامه‌ی اکشنی که قبل از رفتن به تنظیمات نیمه‌کاره مانده بود)
    useEffect(()=>{
        const subscription = AppState.addEventListener('change', async (nextAppState)=>{
            if(appState.current.match(/inactive|background/) && nextAppState === 'active'){
                if(pendingActionRef.current){
                    const action = pendingActionRef.current
                    pendingActionRef.current = null
                    AlertBottomDrawerHelper.hideAlert()
                    // چه کاربر در تنظیمات دسترسی را فعال کرده باشد چه نه، اجازه‌ی ورود همچنان داده می‌شود؛
                    // این دسترسی اختیاری است و مانع ورود به بازی نمی‌شود.
                    action()
                }
            }
            appState.current = nextAppState
        })
        return ()=> subscription.remove()
    }, [])

    // پیش از اجرای اکشن حساس (لاگین / ورود مهمان) صدا زده می‌شود.
    // این تابع هرگز اکشن را برای همیشه مسدود نمی‌کند؛ فقط یک‌بار تلاش (سیستمی + مودال داخلی) برای گرفتن دسترسی انجام می‌دهد.
    async function ensureNotificationPermission(action) {
        if (Platform.OS === 'android' && Platform.Version < 33) {
            action()
            return
        }
        try {
            const status = await requestNotificationPermissionStatus()

            if (status === 'granted') {
                action()
                return
            }

            if (status === 'never_ask_again') {
                if (permissionModalShownRef.current) {
                    // مودال قبلاً یک‌بار نمایش داده شده و کاربر تصمیمش را گرفته؛ دیگر مزاحمش نمی‌شویم
                    action()
                    return
                }
                permissionModalShownRef.current = true
                pendingActionRef.current = action
                showPermissionModal()
                return // اکشن بعد از تصمیم کاربر در مودال (لغو/تنظیمات) اجرا می‌شود
            }

            // status === 'denied' -> دیالوگ سیستمی همین الان یک‌بار نشان داده و کاربر رد کرده است.
            // چون این دسترسی اختیاری است، مانع ورود نمی‌شویم و فقط یک یادآوری نرم نشان می‌دهیم.
            showToast({
                title: "دسترسی اعلان‌ها",
                message: "با فعال کردن اعلان‌ها از گردونه شانس، جوایز روزانه و مراحل جدید باخبر می‌شوید.",
                type: "warning",
                animationType: "slide",
                position: "top",
            });
            action()
        } catch (error) {
            console.log('Permission Error:', error);
            // در صورت بروز هرگونه خطای غیرمنتظره در مسیر گرفتن دسترسی، باز هم نباید ورود کاربر مسدود شود
            action()
        }
    }

    const showPermissionModal = () => {
        const btn = [
            {
                onPress : ()=>{
                    onPressGoToSettings()
                },
                text: "فعال کردن",
                loading: false,
                type: "bold",
            },
            {
                onPress : ()=>{
                    onPressCancelModal()
                },
                text: "لغو و ادامه",
                loading: false,
                type: "border",
            },
        ]
        
        AlertBottomDrawerHelper.showAlert({
            title:"فعال سازی نوتیفیکیشن",
            message: [
                {
                    text:"اعلانات را فعال کنید تا چالش‌های روزانهٔ «حرف آخر»، بسته‌های جدید داستانی و رویدادهای ویژهٔ «حرف حساب» را از دست ندهید.",
                    style:{fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a2, alignSelf:'flex-start', textAlign:'justify', lineHeight:26},
                }
            ],
            buttons:btn,
            options:{
                cancelable: true,
                icon:{
                    Icon:()=>(
                        <Icon name={"notifications-on"} type={"MaterialIcons"} style={{fontSize:80, color:colors.primary.a3}}/>
                    )
                }
            }
        })
    }

    const login = () => {
        ensureNotificationPermission(()=>{
            props.navigation.navigate("Login")
        })
    }

    const loginAsGuestOperation = () => {
        ensureNotificationPermission(doLoginAsGuest)
    }

    const onPressCancelModal = () => {
        loginAfterModalDecision()
    }

    const onPressGoToSettings = () => {
        Linking.openSettings()
    }

    // چون action خودش داخل pendingActionRef ذخیره شده، این تابع کمکی برای دکمه‌ی لغو است
    const loginAfterModalDecision = () => {
        const action = pendingActionRef.current
        if (action) {
            pendingActionRef.current = null
            action()
        }
    }

    const doLoginAsGuest = async() => {
        setLoading(true)
        let firebase_token = null
        try {
            const messaging = getMessaging();
            firebase_token = await getToken(messaging);
        } catch (error) {
            firebase_token = null
        }

        const [os, os_version, device_brand, device_name, device_model, app_version, app_build_number, unique_id] = await Promise.all([
            DeviceInfo.getSystemName(),
            DeviceInfo.getSystemVersion(),
            DeviceInfo.getBrand(),
            DeviceInfo.getDeviceName(),
            DeviceInfo.getModel(),
            DeviceInfo.getVersion(),
            DeviceInfo.getBuildNumber(),
            DeviceInfo.getUniqueId()
        ]);
        await axios({
            url:'/',
            method:'post',
            data: {
                query : `
                mutation loginAsGuestByUser(
                    $constants_version : Int,
                    $firebase_token : String,
                    $app_version : String,
                    $app_build_number : Int,
                    $os : String,
                    $os_version : String,
                    $device_brand : String,
                    $device_name : String,
                    $device_model : String,
                    $unique_id : String,
                    $target_store : String,
                    $build_type : String,
                    $coin_plans_version : Int,
                    $subscription_plans_version : Int,
                ){
                    loginAsGuestByUser(
                        constants_version : $constants_version,
                        firebase_token : $firebase_token,
                        app_version : $app_version,
                        app_build_number : $app_build_number,
                        os : $os,
                        os_version : $os_version,
                        device_brand : $device_brand,
                        device_name : $device_name,
                        device_model : $device_model,
                        unique_id : $unique_id,
                        target_store : $target_store,
                        build_type : $build_type,
                        coin_plans_version : $coin_plans_version,
                        subscription_plans_version : $subscription_plans_version,
                    ) {
                        status,
                        message,
                        token,
                        user{name, number_coins},
                        game_constants{
                            constants_version,
                            coins_for_get_help_word_to_slot_stage_game,
                            coins_for_get_help_word_to_slot_package_game,
                            coins_for_get_help_letter_connecting_stage_game,
                            coins_for_get_help_letter_connecting_package_game,
                            coins_reward_from_play_video_ads_current_stage,
                            coins_reward_from_play_video_ads_previous_stage,
                            coins_reward_from_play_video_ads_unknown_word,
                            coins_reward_from_stage_completed_stage_game,
                            coins_reward_from_season_completed_stage_game,
                            coins_reward_from_stage_completed_package_game,
                            coins_reward_from_season_completed_package_game,
                            free_coin_completed_account_info,
                            free_coin_follow_instagram,
                            free_coin_join_telegram,
                            free_coin_view_ads,
                            free_coin_first_rating_in_store,
                        },
                        coin_plans{
                            _id,
                            product_id,
                            title,
                            description,
                            badge,
                            icon_image,
                            number_coin,
                            price,
                            discount_amount,
                            discount_percent,
                            order,
                            is_visible,
                            is_active,
                        },
                        coin_plans_new_version,
                        subscription_plans{
                            _id,
                            product_id,
                            title,
                            description,
                            badge,
                            icon_image,
                            duration,
                            price,
                            discount_amount,
                            discount_percent,
                            order,
                            is_visible,
                            is_active,
                        },
                        subscription_plans_new_version,
                    }
                }
                `,
                variables : {
                    "constants_version" : constants_version,
                    "firebase_token" : firebase_token,
                    "app_version" : app_version,
                    "app_build_number" : Number(app_build_number),
                    "os" : os,
                    "os_version" : os_version,
                    "device_brand" : device_brand,
                    "device_name" : device_name,
                    "device_model" : device_model,
                    "unique_id" : unique_id,
                    "target_store" : TARGET_STORE,
                    "build_type" : BUILD_TYPE,
                    "coin_plans_version" : coinPlansVersion,
                    "subscription_plans_version" : subscriptionPlansVersion,
                }
            }
        }).then(async(response)=>{
            setLoading(false)
            const data = response?.data?.data?.loginAsGuestByUser
            if(data?.status == 200) {
                const token = data?.token
                const name = data?.user?.name ?? null
                if(data?.game_constants){
                    const variables = data.game_constants
                    dispatch(updateConstantsVersion(variables))
                }
                let preloadUrls = [];
                if(data?.coin_plans?.length > 0){
                    const dataList = data?.coin_plans || [];
                    const newCoinPlans = createCoinPlansList(realm, dataList)
                    if(newCoinPlans == true){
                        const newCoinPlansVersion = data?.coin_plans_new_version
                        if(newCoinPlansVersion > 0){
                            dispatch(changeCoinPlansVersion({version:newCoinPlansVersion}))
                        }
                        const coinUrls = dataList.map(plan => `${Globals.uri}${plan.icon_image}`).filter(url => typeof url === 'string' && url.length > 0);
                        preloadUrls.push(...coinUrls);
                    }
                }
                if(data?.subscription_plans?.length > 0){
                    const dataList = data.subscription_plans
                    const newSubscriptionPlans = createSubscriptionPlansList(realm, dataList)
                    if(newSubscriptionPlans == true){
                        const newSubscriptionPlansVersion = data?.subscription_plans_new_version
                        if(newSubscriptionPlansVersion > 0){
                            dispatch(changeSubscriptionPlansVersion({version:newSubscriptionPlansVersion}))
                        }
                        const subscriptionUrls = dataList.map(plan => `${Globals.uri}${plan.icon_image}`).filter(url => typeof url === 'string' && url.length > 0);
                        preloadUrls.push(...subscriptionUrls);
                    }
                }
                await preloadImages(preloadUrls, {
                    batchSize: 8,
                    delayBetweenBatches: 100,
                });
                const numberCoins = data?.user?.number_coins
                if(typeof numberCoins === "number"){
                    dispatch(updateNumberCoins({number:numberCoins}))
                }
                dispatch(loginAsGuest({token, name}))
                axios.defaults.headers.post['token'] = token;
                showToast({
                    title: "ورود به عنوان میهمان",
                    message: "ورود به عنوان میهمان با موفقیت انجام شد.",
                    type: "success",
                    animationType: "slide",
                    position: "top",
                });
            } else {
                showToast({
                    title: "خطا در ورود به عنوان میهمان",
                    message: response?.data?.errors[0]?.data[0]?.message??'مشکلی پیش آمد. لحظاتی بعد دوباره تلاش کنید.',
                    type: "error",
                    animationType: "slide",
                    position: "top",
                });
            }
        }).catch((error)=>{
            setLoading(false)
            showToast({
                title: "خطا در ورود به عنوان میهمان",
                message: 'مشکلی پیش آمد. لحظاتی بعد دوباره تلاش کنید.',
                type: "error",
                animationType: "slide",
                position: "top",
            });
        })
    }

    return(
        <View style={[styles.container, {backgroundColor:colors.background.a1}]}>
            <View style={styles.container2}>
                <Text style={{fontFamily:Font.bakh_bold, fontSize:20, color:colors.text.a1}}>{"دوکلام حرف حساب!"}</Text>
                <View style={{gap:15}}>
                    <View style={{width:width, alignItems:'center'}}>
                        <ButtonGradient
                            height={65}
                            width={width - 40}
                            text={"ورود به حساب یا ثبت نام"}
                            onPress={login}
                            loading={false}
                            textSize={16}
                            borderRadius={10}
                        />
                    </View>
                    <View style={{width:width, alignItems:'center'}}>
                        <ButtonBorder
                            text={"ورود به عنوان میهمان"}
                            height={65}
                            width={width - 40}
                            loading={loading}
                            onPress={loginAsGuestOperation}
                            borderRadius={10}
                            textSize={16}
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    container2: {
        flex:1,
        alignItems:'center',
        justifyContent:'space-around',
    },
});

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    box: {
        width: '100%',
        borderRadius: 16,
        padding: 20,
    },
    title: {
        fontSize: 17,
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 14,
        textAlign: 'right',
        lineHeight: 24,
        marginBottom: 12,
    },
    explain: {
        fontSize: 12.5,
        textAlign: 'right',
        lineHeight: 21,
        marginBottom: 18,
    },
    settingsButton: {
        backgroundColor: '#4C6FFF',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    settingsButtonText: {
        color: '#fff',
        fontSize: 15,
    },
    closeButton: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    closeButtonText: {
        fontSize: 14,
        opacity: 0.7,
    },
});

export default SignIn