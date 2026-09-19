import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Linking,
  AppState,
} from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import axios from 'axios';
import ButtonGradient from '../../components/buttons/ButtonGradient';
import ButtonBorder from '../../components/buttons/ButtonBorder';
import useAppTheme from '../../hooks/theme/useAppTheme';
import DeviceInfo from 'react-native-device-info';
import { useSelector, useDispatch } from 'react-redux';
import Globals from '../../utils/Globals';
import { updateConstantsVersion } from '../../redux/slices/constantsSlice';
import { changeCoinPlansVersion, updateNumberCoins } from '../../redux/slices/coinSlice';
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

const {width} = Dimensions.get('window');

// حداکثر تعداد دفعاتی که مودال سفارشی نمایش داده می‌شود
const MAX_PROMPTS = 2;
// اگر درخواست سیستمی زودتر از این مدت (میلی‌ثانیه) برگردد، یعنی دیالوگ اصلاً نمایش داده نشده است
const SYSTEM_DIALOG_MIN_MS = 500;

const MODAL_TEXTS = {
    first: {
        title: "فعال سازی نوتیفیکیشن",
        message: "اعلانات را فعال کنید تا چالش‌های روزانهٔ «حرف آخر»، بسته‌های جدید داستانی و رویدادهای ویژهٔ «حرف حساب» را از دست ندهید.",
    },
    second: {
        title: "فقط یک قدم مانده!",
        message: "اعلان‌ها فقط برای چیزهای مهم ارسال می‌شوند: چالش روزانه، جایزهٔ گردونه شانس و بسته‌های جدید. هر وقت خواستید می‌توانید خاموششان کنید.",
    },
    blocked: {
        title: "اعلان‌ها را از تنظیمات فعال کنید",
        message: "دسترسی اعلان‌ها برای برنامه بسته شده است. با رفتن به تنظیمات و روشن کردن «اعلان‌ها» از چالش‌ها و جوایز باخبر می‌شوید. این کار فقط چند ثانیه طول می‌کشد.",
    },
};

// بررسی وضعیت فعلی، بدون نمایش هیچ دیالوگی
async function hasNotificationPermission() {
    if (Platform.OS === 'android') {
        if (Platform.Version < 33) return true; // زیر اندروید 13 نیازی به permission نیست
        try {
            return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        } catch (error) {
            return false;
        }
    }
    try {
        const status = await hasPermission(getMessaging());
        return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
    } catch (error) {
        return false;
    }
}

// خروجی: 'granted' | 'denied' | 'never_ask_again'
async function requestNotificationPermission() {
    if (Platform.OS === 'android') {
        try {
            return await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        } catch (error) {
            return 'denied';
        }
    }
    try {
        const status = await requestPermission(getMessaging());
        if (status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL) {
            return 'granted';
        }
        // در iOS بعد از یک‌بار رد شدن، دیالوگ سیستمی دیگر نمایش داده نمی‌شود
        if (status === AuthorizationStatus.DENIED) return 'never_ask_again';
        return 'denied';
    } catch (error) {
        return 'denied';
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

    const promptCountRef = useRef(0)              // تعداد دفعات نمایش مودال سفارشی
    const systemBlockedRef = useRef(false)        // سیستم دیگر دیالوگ نشان نمی‌دهد (فقط تنظیمات)
    const requestingRef = useRef(false)           // جلوگیری از اجرای هم‌زمان دو درخواست
    const waitingForSettingsRef = useRef(false)   // کاربر به تنظیمات رفته است
    const pendingActionRef = useRef(null)         // اکشنی که بعد از برگشت از تنظیمات اجرا می‌شود
    const appStateRef = useRef(AppState.currentState)

    useEffect(()=>{
        setUserConsent(true);
    }, [])

    // برگشت از تنظیمات گوشی: فقط اگر خودمان کاربر را به تنظیمات فرستاده بودیم، اکشن را ادامه می‌دهیم
    useEffect(()=>{
        const subscription = AppState.addEventListener('change', (nextAppState)=>{
            const cameBack = /inactive|background/.test(appStateRef.current) && nextAppState === 'active'
            appStateRef.current = nextAppState
            if(cameBack && waitingForSettingsRef.current){
                waitingForSettingsRef.current = false
                const action = pendingActionRef.current
                pendingActionRef.current = null
                action?.()
            }
        })
        return ()=> subscription.remove()
    }, [])

    // قبل از هر اکشن (ورود / ورود مهمان) صدا زده می‌شود
    const ensureNotificationPermission = async (action) => {
        if (await hasNotificationPermission()) {
            action()
            return
        }
        if (promptCountRef.current >= MAX_PROMPTS) {
            action()
            return
        }
        promptCountRef.current += 1
        showPermissionModal(action)
    }

    const showPermissionModal = (action) => {
        const blocked = systemBlockedRef.current
        const content = blocked
            ? MODAL_TEXTS.blocked
            : (promptCountRef.current === 1 ? MODAL_TEXTS.first : MODAL_TEXTS.second)

        AlertBottomDrawerHelper.showAlert({
            title: content.title,
            message: [
                {
                    text: content.message,
                    style:{fontFamily:Font.bakh_semi_bold, fontSize:14, color:colors.text.a2, alignSelf:'flex-start', textAlign:'justify', lineHeight:26},
                }
            ],
            buttons: [
                {
                    onPress: ()=> onPressEnable(action),
                    text: blocked ? "رفتن به تنظیمات" : "فعال کردن",
                    loading: false,
                    type: "bold",
                },
                {
                    onPress: ()=> onPressSkip(action),
                    text: "لغو و ادامه",
                    loading: false,
                    type: "border",
                },
            ],
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

    // کاربر «لغو و ادامه» را زد؛ تصمیمش را احترام می‌گذاریم و دیگر مزاحمش نمی‌شویم
    const onPressSkip = (action) => {
        AlertBottomDrawerHelper.hideAlert()
        promptCountRef.current = MAX_PROMPTS
        action()
    }

    const openSettingsThenContinue = (action) => {
        promptCountRef.current = MAX_PROMPTS
        pendingActionRef.current = action
        waitingForSettingsRef.current = true
        Linking.openSettings().catch(()=>{
            waitingForSettingsRef.current = false
            pendingActionRef.current = null
            action()
        })
    }

    const onPressEnable = async (action) => {
        AlertBottomDrawerHelper.hideAlert()
        if (requestingRef.current) return

        // سیستم دیگر دیالوگ نشان نمی‌دهد؛ تنها راه، تنظیمات است
        if (systemBlockedRef.current) {
            openSettingsThenContinue(action)
            return
        }

        requestingRef.current = true
        const startedAt = Date.now()
        const result = await requestNotificationPermission()
        requestingRef.current = false
        const dialogWasShown = (Date.now() - startedAt) > SYSTEM_DIALOG_MIN_MS

        if (result === 'granted') {
            action()
            return
        }

        if (result === 'never_ask_again') {
            systemBlockedRef.current = true
            // دیالوگی نمایش داده نشده بود (قبلاً برای همیشه رد شده)؛ مستقیم می‌رویم تنظیمات
            if (!dialogWasShown) {
                openSettingsThenContinue(action)
                return
            }
        }

        // کاربر در دیالوگ سیستمی رد کرد
        if (promptCountRef.current >= MAX_PROMPTS) {
            action() // دور آخر بود؛ کاربر را بیشتر از این معطل نمی‌کنیم
            return
        }
        showToast({
            title: "اعلان‌ها غیرفعال ماند",
            message: "برای ادامه دوباره روی دکمه بزنید.",
            type: "warning",
            animationType: "slide",
            position: "top",
        });
    }

    const login = () => {
        ensureNotificationPermission(()=>{
            props.navigation.navigate("Login")
        })
    }

    const loginAsGuestOperation = () => {
        ensureNotificationPermission(doLoginAsGuest)
    }

    const doLoginAsGuest = async() => {
        setLoading(true)
        try {
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

            const response = await axios({
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
            })

            const data = response?.data?.data?.loginAsGuestByUser
            if(data?.status == 200) {
                const token = data?.token
                const name = data?.user?.name ?? null
                if(data?.game_constants){
                    dispatch(updateConstantsVersion(data.game_constants))
                }
                const preloadUrls = [];
                if(data?.coin_plans?.length > 0){
                    const dataList = data.coin_plans;
                    if(createCoinPlansList(realm, dataList) == true){
                        const newVersion = data?.coin_plans_new_version
                        if(newVersion > 0){
                            dispatch(changeCoinPlansVersion({version:newVersion}))
                        }
                        preloadUrls.push(...dataList.map(plan => `${Globals.uri}${plan.icon_image}`).filter(url => typeof url === 'string' && url.length > 0));
                    }
                }
                if(data?.subscription_plans?.length > 0){
                    const dataList = data.subscription_plans
                    if(createSubscriptionPlansList(realm, dataList) == true){
                        const newVersion = data?.subscription_plans_new_version
                        if(newVersion > 0){
                            dispatch(changeSubscriptionPlansVersion({version:newVersion}))
                        }
                        preloadUrls.push(...dataList.map(plan => `${Globals.uri}${plan.icon_image}`).filter(url => typeof url === 'string' && url.length > 0));
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
                    message: response?.data?.errors?.[0]?.data?.[0]?.message ?? 'مشکلی پیش آمد. لحظاتی بعد دوباره تلاش کنید.',
                    type: "error",
                    animationType: "slide",
                    position: "top",
                });
            }
        } catch (error) {
            showToast({
                title: "خطا در ورود به عنوان میهمان",
                message: 'مشکلی پیش آمد. لحظاتی بعد دوباره تلاش کنید.',
                type: "error",
                animationType: "slide",
                position: "top",
            });
        } finally {
            setLoading(false)
        }
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
        justifyContent: 'space-between',
    },
    container2: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
});

export default SignIn