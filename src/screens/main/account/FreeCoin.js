import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    ScrollView,
    ImageBackground,
    Text,
    Linking,
    AppState,
    NativeModules,
    useWindowDimensions,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import useAppTheme from '../../../hooks/theme/useAppTheme';
import GeneralHeader from '../../../components/header/GeneralHeader';
import Icon from '../../../utils/Icon';
import Font from '../../../utils/Font';
import SimpleItem from '../../../components/list-view-items/SimpleItem';
import LocalImageComponent from '../../../components/image-components/LocalImageComponent';
import Globals from '../../../utils/Globals';
import {TapsellLegacyAdapter} from '@react-native-tapsell-mediation/legacy';
import {CompletionState, requestRewardedAd, showRewardedAd} from '@react-native-tapsell-mediation/tapsell';
import FullScreenLoadingHelper from '../../../components/full-screen-loading/FullScreenLoadingHelper';
import {tapsell} from '../../../utils/constants/tapsell';
import {showToast} from '../../../components/custom-toast/ToastRef';
import AlertBottomDrawerHelper from '../../../components/alert-bottom-drawer/AlertBottomDrawerHelper';
import {increaseNumberCoins} from '../../../redux/slices/coinSlice';
import {TARGET_STORE} from '../../../utils/constants/build-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {WaveIndicator} from 'react-native-indicators';
import * as Progress from 'react-native-progress';
import axios from 'axios';
import {getRewardAdsStatus, registerRewardAdWatch} from '../../../utils/adsLimitStorage';
import TimerUIThread from '../../../components/timer/TimerUIThread';
import {
    useSharedValue,
    withTiming,
    Easing,
    runOnJS,
    useAnimatedReaction,
    cancelAnimation,
} from 'react-native-reanimated';
import {useStatusBarHeight} from '../../../hooks/useStatusBarHeight';

const {CafeBazaar, Myket, ImmersiveMode} = NativeModules;

/* ═════════════ ثابت‌ها ═════════════ */
// کلیدهای ذخیره‌سازی و فیلدهای سرور (همان allowedFields قبلی)
const TYPE = {
    INSTAGRAM: 'follow_instagram',
    TELEGRAM: 'joined_telegram',
    STORE: 'rated_in_store',
};

const VERIFY_SECONDS = 30;

const AD_LOAD_ERROR_MESSAGE =
    'مشکلی در بارگذاری ویدیو پیش آمد. اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.';
const AD_LIMIT_MESSAGE = 'در حال حاضر نمایش ویدیو محدود شده است.';
const AD_SKIPPED_MESSAGE = 'برای دریافت سکه، باید ویدیو را تا انتها تماشا کنید.';

const CHECK_PERMISSION_QUERY = `
    query checkPermissionToGiveFreeCoin($type : String!){
        checkPermissionToGiveFreeCoin(type : $type) {
            status,
        }
    }
`;
const APPLY_FREE_COIN_QUERY = `
    mutation applyFreeCoinAllowedFieldsForUser($type : String!){
        applyFreeCoinAllowedFieldsForUser(type : $type) {
            status,
        }
    }
`;

// متن و آیکن آلرت‌های «آیا انجام دادید؟» برای هر نوع (قبلاً سه تابع تقریباً یکسان بود)
const VERIFY_META = {
    [TYPE.STORE]: {
        iconName: 'star-half-alt',
        iconColor: null, // از تم گرفته می‌شود (colors.primary.a5)
        cancel: 'لغو ثبت امتیاز',
        texts: game => ({
            title: `${game} در فروشگاه`,
            question: `آیا به ${game} امتیاز دادید؟`,
            notDone: '* اگر امتیاز ثبت نکردید، برای دریافت سکه دوباره تلاش کنید.',
            done: '* اگر امتیاز ثبت کردید، برای دریافت سکه لطفا کمی منتظر بمانید.',
        }),
    },
    [TYPE.INSTAGRAM]: {
        iconName: 'instagram',
        iconColor: '#E1306C',
        cancel: 'لغو دنبال کردن',
        texts: game => ({
            title: `صفحهٔ اینستاگرام ${game}`,
            question: `آیا صفحهٔ اینستاگرام ${game} را دنبال کردید؟`,
            notDone: '* اگر صفحهٔ اینستاگرام را دنبال نکردید، برای دریافت سکه دوباره تلاش کنید.',
            done: '* اگر صفحهٔ اینستاگرام را دنبال کردید، برای دریافت سکه لطفا کمی منتظر بمانید.',
        }),
    },
    [TYPE.TELEGRAM]: {
        iconName: 'telegram-plane',
        iconColor: '#24A1DE',
        cancel: 'لغو عضویت',
        texts: game => ({
            title: `کانال تلگرام ${game}`,
            question: `آیا در کانال تلگرام ${game} عضو شدید؟`,
            notDone: '* اگر در کانال تلگرام عضو نشدید، برای دریافت سکه دوباره تلاش کنید.',
            done: '* اگر در کانال تلگرام عضو شدید، برای دریافت سکه لطفا کمی منتظر بمانید.',
        }),
    },
};

const showErrorToast = (message, duration = 5000) =>
    showToast({
        title: 'مشکلی پیش آمد',
        message,
        type: 'error',
        animationType: 'slide',
        position: 'top',
        duration,
    });

// بعد از ۴ ثانیه آلرت بسته شود و خطا نشان داده شود (همان رفتار قبلی)
const hideAlertThenToast = message =>
    setTimeout(() => {
        AlertBottomDrawerHelper.hideAlert();
        showErrorToast(message);
    }, 4000);

/* ═════════════ اجزای کوچک (در سطح ماژول؛ هویتشان ثابت است) ═════════════ */
const CoinValue = memo(function CoinValue({value}) {
    const colors = useAppTheme();
    return (
        <View style={styles.coinRow}>
            {value ? <Text style={[styles.coinText, {color: colors.primary.a3}]}>{value}</Text> : null}
            <LocalImageComponent
                path={require('../../../assets/image/coin.png')}
                width={20}
                height={20}
                resizeMode="stretch"
                blank_background
            />
        </View>
    );
});

const AdsValue = memo(function AdsValue({adsStatus, value}) {
    const colors = useAppTheme();
    return (
        <View style={styles.adsValueRow}>
            {adsStatus?.allowed === false ? (
                <TimerUIThread
                    style={{fontSize: 14, fontFamily: Font.black, color: colors.primary.a3}}
                    titleStyle={{fontFamily: Font.bakh_semi_bold, color: `${colors.primary.a3}99`}}
                    seconds={adsStatus.seconds}
                    minutes={adsStatus.minutes}
                    hours={adsStatus.hours}
                />
            ) : (
                <CoinValue value={value} />
            )}
        </View>
    );
});

const TimerComponent = memo(function TimerComponent({iconName, iconType, color, endTime}) {
    const colors = useAppTheme();
    const [second, setSecond] = useState(VERIFY_SECONDS);
    const timeLeft = useSharedValue(VERIFY_SECONDS);

    useEffect(() => {
        timeLeft.value = withTiming(
            0,
            {duration: VERIFY_SECONDS * 1000, easing: Easing.linear},
            finished => {
                if (finished) {
                    runOnJS(endTime)();
                }
            },
        );
        return () => {
            cancelAnimation(timeLeft);
        };
    }, []);

    useAnimatedReaction(
        () => Math.ceil(timeLeft.value),
        (currentValue, previousValue) => {
            if (currentValue !== previousValue && currentValue >= 0) {
                runOnJS(setSecond)(currentValue);
            }
        },
    );

    return (
        <View style={styles.timerRoot}>
            <View style={styles.timerCircleBox}>
                <Icon name={iconName} type={iconType} style={{fontSize: 50, color}} />
                <View style={styles.timerWaveLayer}>
                    <WaveIndicator color={color} size={160} count={2} waveMode="fill" />
                </View>
                <View style={styles.timerProgressLayer}>
                    <Progress.Circle
                        progress={(VERIFY_SECONDS - second) / VERIFY_SECONDS}
                        size={100}
                        thickness={4}
                        color={colors.primary.a3}
                        borderWidth={1}
                        borderColor={colors.alert.a1}
                    />
                </View>
            </View>
            <Text style={{fontFamily: Font.black, color: colors.primary.a3, fontSize: 25}}>
                {String(second).padStart(2, '0')}
            </Text>
            <Text style={{fontFamily: Font.bakh_semi_bold, color: `${colors.primary.a3}99`, fontSize: 12}}>
                {'در حال بررسی...'}
            </Text>
        </View>
    );
});

/* ═════════════ صفحه ═════════════ */
function FreeCoin(props) {
    const STATUS_BAR_HEIGHT = useStatusBarHeight();
    const windowDims = useWindowDimensions();
    const immersive = ImmersiveMode.isImmersiveModeActive();
    const {width, height} = immersive ? Dimensions.get('screen') : windowDims;

    const dispatch = useDispatch();
    const colors = useAppTheme();
    const [adsStatus, setAdsStatus] = useState(null);
    const {loginType} = useSelector(state => state.account);
    const {
        free_coin_completed_account_info,
        free_coin_follow_instagram,
        free_coin_join_telegram,
        free_coin_view_ads,
        free_coin_first_rating_in_store,
    } = useSelector(state => state.constants);

    const appState = useRef(AppState.currentState);
    // به‌جای سه پرچم wentToX: فقط یکی از 'instagram' | 'telegram' | 'store' | null
    const pendingReturnRef = useRef(null);
    // به‌جای سه ref جدا: مجوز دریافت سکه برای هر نوع
    const permissionRef = useRef({[TYPE.INSTAGRAM]: false, [TYPE.TELEGRAM]: false, [TYPE.STORE]: false});

    const rewardByType = useMemo(
        () => ({
            [TYPE.INSTAGRAM]: free_coin_follow_instagram,
            [TYPE.TELEGRAM]: free_coin_join_telegram,
            [TYPE.STORE]: free_coin_first_rating_in_store,
        }),
        [free_coin_follow_instagram, free_coin_join_telegram, free_coin_first_rating_in_store],
    );

    /* ───────── وضعیت تبلیغ ───────── */
    useEffect(() => {
        let alive = true;
        getRewardAdsStatus().then(status => alive && setAdsStatus(status));
        TapsellLegacyAdapter.register();
        return () => {
            alive = false;
        };
    }, []);

    const registerLocalHistoryAds = useCallback(async () => {
        const updatedStatus = await registerRewardAdWatch();
        setAdsStatus(updatedStatus);
    }, []);

    /* ───────── آلرت‌ها ───────── */
    const alertTextStyle = useMemo(
        () => ({
            width: width - 30,
            fontFamily: Font.bakh_semi_bold,
            fontSize: 14,
            color: colors.text.a2,
            alignSelf: 'center',
            textAlign: 'center',
            lineHeight: 24,
        }),
        [width, colors.text.a2],
    );
    const questionStyle = useMemo(
        () => ({
            maxWidth: width - 65,
            fontFamily: Font.bakh_bold,
            fontSize: 16,
            color: colors.alert.a1,
            alignSelf: 'flex-start',
            textAlign: 'justify',
            lineHeight: 30,
        }),
        [width, colors.alert.a1],
    );
    const hintStyle = useMemo(
        () => ({
            maxWidth: width - 30,
            fontFamily: Font.bakh_semi_bold,
            fontSize: 12,
            color: colors.text.a6,
            alignSelf: 'flex-start',
            textAlign: 'justify',
            lineHeight: 25,
        }),
        [width, colors.text.a6],
    );

    const renderErrorIcon = useCallback(
        () => <Icon name={'error-outline'} type={'MaterialIcons'} style={{color: colors.alert.a1, fontSize: 50}} />,
        [colors.alert.a1],
    );
    const renderCoinIcon = useCallback(
        () => (
            <View style={{width, alignItems: 'center'}}>
                <LocalImageComponent
                    path={require('../../../assets/image/coin.png')}
                    width={80}
                    height={80}
                    resizeMode={'stretch'}
                    blank_background={true}
                />
            </View>
        ),
        [width],
    );

    // آلرت ساده‌ی «دریافت سکه» با یک متن وسط‌چین و دکمه‌ی «متوجه شدم»
    const showCoinAlert = useCallback(
        (text, renderIcon) => {
            AlertBottomDrawerHelper.showAlert({
                title: 'دریافت سکه',
                message: [{text, style: alertTextStyle}],
                buttons: [{onPress: () => {}, text: 'متوجه شدم', loading: false, stayOpen: false, type: 'bold'}],
                options: {cancelable: true, icon: {Icon: renderIcon}},
            });
        },
        [alertTextStyle],
    );

    /* ───────── نمایش ویدیو ───────── */
    const showRewardedAdCallBack = useCallback(
        id => {
            FullScreenLoadingHelper.hideLoading();
            if (!id) {
                showCoinAlert(AD_LOAD_ERROR_MESSAGE, renderErrorIcon);
                return;
            }
            showRewardedAd(id, {
                onAdImpression: () => {},
                onAdClicked: () => {},
                onRewarded: () => {
                    dispatch(increaseNumberCoins({number: free_coin_view_ads}));
                    registerLocalHistoryAds();
                    showCoinAlert(`تعداد ${free_coin_view_ads} سکه با موفقیت به حساب کاربری شما اضافه شد.`, renderCoinIcon);
                },
                onAdClosed: completionState => {
                    if (CompletionState[completionState] == 'SKIPPED') {
                        showCoinAlert(AD_SKIPPED_MESSAGE, renderErrorIcon);
                    }
                },
                onAdFailed: () => {
                    showCoinAlert(AD_LOAD_ERROR_MESSAGE, renderErrorIcon);
                },
            });
        },
        [dispatch, free_coin_view_ads, registerLocalHistoryAds, showCoinAlert, renderCoinIcon, renderErrorIcon],
    );

    const requestShowAd = useCallback(async () => {
        const status = await getRewardAdsStatus();
        if (status.allowed == true) {
            FullScreenLoadingHelper.showLoading({title: 'در حال بارگذاری...', cancelable: false});
            try {
                const id = await requestRewardedAd(tapsell.position.get_free_coin.zone_id);
                showRewardedAdCallBack(id);
            } catch (e) {
                showErrorToast(AD_LOAD_ERROR_MESSAGE);
                FullScreenLoadingHelper.hideLoading();
            }
        } else {
            showErrorToast(AD_LIMIT_MESSAGE);
        }
    }, [showRewardedAdCallBack]);

    /* ───────── بررسی و اعطای سکه‌ی آیتم‌های یک‌بارمصرف ───────── */
    const checkPermissionAllowedFields = useCallback(async type => {
        const stored = await AsyncStorage.getItem(type);
        if (stored === '1') {
            permissionRef.current[type] = false;
            hideAlertThenToast('از این آیتم، شما قبلا سکه دریافت کرده‌اید.');
            return;
        }
        try {
            const response = await axios({
                url: '/',
                method: 'post',
                data: {query: CHECK_PERMISSION_QUERY, variables: {type}},
            });
            const result = response.data?.data?.checkPermissionToGiveFreeCoin;
            if (result?.status == 200) {
                permissionRef.current[type] = true;
            } else {
                permissionRef.current[type] = false;
                // دسترسی امن: اگر errors وجود نداشت، قبلاً TypeError می‌داد و toast نشان داده نمی‌شد
                const err = response?.data?.errors?.[0]?.data?.[0];
                hideAlertThenToast(err?.message ?? 'در حال حاضر امکان دریافت سکه از این آیتم وجود ندارد.');
                if (err?.get_previous == true) {
                    await AsyncStorage.setItem(type, '1');
                }
            }
        } catch (error) {
            permissionRef.current[type] = false;
        }
    }, []);

    const applyFreeCoinAllowedFields = useCallback(
        async type => {
            try {
                const response = await axios({
                    url: '/',
                    method: 'post',
                    data: {query: APPLY_FREE_COIN_QUERY, variables: {type}},
                });
                const result = response.data?.data?.applyFreeCoinAllowedFieldsForUser;
                if (result?.status == 200) {
                    await AsyncStorage.setItem(type, '1');
                    AlertBottomDrawerHelper.hideAlert();
                    const amount = rewardByType[type] ?? 0;
                    dispatch(increaseNumberCoins({number: amount}));
                    setTimeout(() => {
                        showCoinAlert(`تعداد ${amount} سکه با موفقیت به حساب کاربری شما اضافه شد.`, renderCoinIcon);
                    }, 700);
                } else {
                    AlertBottomDrawerHelper.hideAlert();
                }
            } catch (error) {
                AlertBottomDrawerHelper.hideAlert();
            }
        },
        [dispatch, rewardByType, showCoinAlert, renderCoinIcon],
    );

    // آلرت مشترک «آیا دنبال/عضو/امتیاز دادید؟» با شمارش معکوس ۳۰ ثانیه‌ای
    const showVerificationAlert = useCallback(
        (type, onRetry) => {
            checkPermissionAllowedFields(type);
            const meta = VERIFY_META[type];
            const t = meta.texts(Globals.game_name_fa);
            const iconColor = meta.iconColor ?? colors.primary.a5;

            AlertBottomDrawerHelper.showAlert({
                title: t.title,
                message: [
                    {text: t.question, style: questionStyle},
                    {text: t.notDone, style: hintStyle},
                    {text: t.done, style: hintStyle},
                ],
                buttons: [
                    {onPress: () => onRetry(), text: 'تلاش دوباره', loading: false, stayOpen: false, type: 'bold'},
                    {onPress: () => {}, text: meta.cancel, loading: false, stayOpen: false, type: 'border'},
                ],
                options: {
                    cancelable: false,
                    icon: {
                        Icon: () => (
                            <TimerComponent
                                iconName={meta.iconName}
                                iconType={'FontAwesome5'}
                                color={iconColor}
                                endTime={() => {
                                    if (permissionRef.current[type] == true) {
                                        applyFreeCoinAllowedFields(type);
                                    } else {
                                        AlertBottomDrawerHelper.hideAlert();
                                    }
                                }}
                            />
                        ),
                    },
                },
            });
        },
        [checkPermissionAllowedFields, applyFreeCoinAllowedFields, colors.primary.a5, questionStyle, hintStyle],
    );

    /* ───────── فروشگاه / اینستاگرام / تلگرام ───────── */
    const handleCafeBazaarRating = useCallback(async () => {
        try {
            const success = await CafeBazaar.openRating();
            if (success) {
                pendingReturnRef.current = 'store';
            }
        } catch (error) {
            showErrorToast('خطایی در باز کردن کافه‌ بازار پیش آمد. یا اینکه کافه بازار نصب نیست.', 4000);
        }
    }, []);

    const handleMyketRating = useCallback(async () => {
        try {
            const success = await Myket.openRating();
            if (success) {
                pendingReturnRef.current = 'store';
            }
        } catch (error) {
            if (error.code === 'E_MYKET_NOT_INSTALLED') {
                showErrorToast('تا زمانی که مایکت نصب نباشد ثبت نظر و امتیاز ممکن نیست.', 4000);
            } else {
                showErrorToast('خطایی در باز کردن مایکت پیش آمد.', 4000);
            }
        }
    }, []);

    const setRaiting = useCallback(() => {
        if (TARGET_STORE == 'cafebazaar') {
            handleCafeBazaarRating();
        } else if (TARGET_STORE == 'myket') {
            handleMyketRating();
        }
    }, [handleCafeBazaarRating, handleMyketRating]);

    const followInstagram = useCallback(async () => {
        pendingReturnRef.current = 'instagram';
        await Linking.openURL(Globals.instagram_page_url);
    }, []);

    const joinToTelegram = useCallback(async () => {
        pendingReturnRef.current = 'telegram';
        await Linking.openURL(Globals.telegram_channel_url);
    }, []);

    const operationRating = useCallback(() => showVerificationAlert(TYPE.STORE, setRaiting), [showVerificationAlert, setRaiting]);
    const operationInstagramFollow = useCallback(() => showVerificationAlert(TYPE.INSTAGRAM, followInstagram), [showVerificationAlert, followInstagram]);
    const operationTelegramJoining = useCallback(() => showVerificationAlert(TYPE.TELEGRAM, joinToTelegram), [showVerificationAlert, joinToTelegram]);

    // وقتی کاربر از اینستاگرام/تلگرام/فروشگاه برگشت، آلرت مربوط نشان داده شود.
    // handlersRef همیشه آخرین نسخه‌ی توابع را دارد؛ پس listener با width/colors قدیمی کار نمی‌کند.
    const handlersRef = useRef({});
    handlersRef.current = {
        instagram: operationInstagramFollow,
        telegram: operationTelegramJoining,
        store: operationRating,
    };

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                const pending = pendingReturnRef.current;
                if (pending) {
                    pendingReturnRef.current = null;
                    handlersRef.current[pending]();
                }
            }
            appState.current = nextAppState;
        });
        return () => subscription.remove();
    }, []);

    /* ───────── کامپوننت‌های مقدار آیتم‌ها (هویت پایدار؛ فقط با تغییر مقدارشان عوض می‌شوند) ───────── */
    const AdsValueComponent = useCallback(
        () => <AdsValue adsStatus={adsStatus} value={free_coin_view_ads} />,
        [adsStatus, free_coin_view_ads],
    );
    const AccountValueComponent = useCallback(() => <CoinValue value={free_coin_completed_account_info} />, [free_coin_completed_account_info]);
    const InstagramValueComponent = useCallback(() => <CoinValue value={free_coin_follow_instagram} />, [free_coin_follow_instagram]);
    const TelegramValueComponent = useCallback(() => <CoinValue value={free_coin_join_telegram} />, [free_coin_join_telegram]);
    const RatingValueComponent = useCallback(() => <CoinValue value={free_coin_first_rating_in_store} />, [free_coin_first_rating_in_store]);

    const onAccountInfoPress = useCallback(() => {
        if (loginType == 'registered') {
            props.navigation.navigate('AccountManagement');
        } else {
            props.navigation.navigate('LoginToAccount');
            showToast({
                title: `ورود به حساب`,
                message: 'قبل از تکمیل اطلاعات، ابتدا باید وارد حساب کاربری خود شوید.',
                type: 'info',
                animationType: 'slide',
                position: 'top',
                duration: 5000,
            });
        }
    }, [loginType, props.navigation]);

    /* ───────── استایل‌های وابسته به ابعاد/تم ───────── */
    const rootStyle = useMemo(
        () => ({flex: 1, backgroundColor: colors.background.a2, paddingTop: immersive ? STATUS_BAR_HEIGHT : 0}),
        [colors.background.a2, immersive, STATUS_BAR_HEIGHT],
    );
    const contentBoxStyle = useMemo(() => ({flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.a1}), [colors.background.a1]);
    const frameStyle = useMemo(
        () => ({width: width - 20, height: immersive ? height - (80 + STATUS_BAR_HEIGHT) : height - 80, paddingVertical: '3.5%'}),
        [width, height, immersive, STATUS_BAR_HEIGHT],
    );
    const listBoxStyle = useMemo(() => ({borderRadius: '10%', overflow: 'hidden', width: width - 40, alignItems: 'center', alignSelf: 'center'}), [width]);
    const sectionLabelStyle = useMemo(() => ({fontFamily: Font.bakh_semi_bold, fontSize: 12, color: colors.text.a4}), [colors.text.a4]);

    return (
        <View style={rootStyle}>
            <GeneralHeader coin={true} back={true} title={'دریافت سکه رایگان'} />
            <View style={contentBoxStyle}>
                <ImageBackground
                    source={require('../../../assets/image/menu_frame_full.png')}
                    style={frameStyle}
                    imageStyle={styles.frameImage}
                    resizeMode="stretch">
                    <View style={listBoxStyle}>
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            <View style={[styles.sectionLabel, styles.sectionLabelFirst]}>
                                <Text style={sectionLabelStyle}>{'دائمی'}</Text>
                            </View>
                            <SimpleItem
                                title={'نمایش ویدیو'}
                                arrow={false}
                                icon_name={'video'}
                                icon_type={'Entypo'}
                                icon_size={25}
                                icon_color={colors.alert.a2}
                                click={requestShowAd}
                                ValueComponent={AdsValueComponent}
                            />
                            <View style={[styles.sectionLabel, styles.sectionLabelSecond]}>
                                <Text style={sectionLabelStyle}>{'فقط یکبار'}</Text>
                            </View>
                            <SimpleItem
                                title={'تکمیل اطلاعات حساب'}
                                arrow={false}
                                icon_name={'person'}
                                icon_type={'Ionicons'}
                                icon_size={25}
                                icon_color={colors.primary.a3}
                                click={onAccountInfoPress}
                                ValueComponent={AccountValueComponent}
                            />
                            <SimpleItem
                                title={'دنبال کردن اینستاگرام'}
                                arrow={false}
                                icon_name={'instagram'}
                                icon_type={'FontAwesome5'}
                                icon_color={'#E1306C'}
                                icon_size={25}
                                click={followInstagram}
                                ValueComponent={InstagramValueComponent}
                            />
                            <SimpleItem
                                title={'پیوستن به کانال تلگرام'}
                                arrow={false}
                                icon_name={'telegram-plane'}
                                icon_type={'FontAwesome5'}
                                icon_color={'#24A1DE'}
                                icon_size={25}
                                click={joinToTelegram}
                                ValueComponent={TelegramValueComponent}
                            />
                            {TARGET_STORE === 'myket' && (
                                <SimpleItem
                                    title={'ثبت امتیاز و نظر به بازی'}
                                    arrow={false}
                                    icon_name={'star-half-alt'}
                                    icon_type={'FontAwesome5'}
                                    icon_size={25}
                                    icon_color={colors.primary.a5}
                                    click={setRaiting}
                                    ValueComponent={RatingValueComponent}
                                />
                            )}
                        </ScrollView>
                    </View>
                </ImageBackground>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    frameImage: {resizeMode: 'stretch'},
    scrollContent: {alignItems: 'center', paddingVertical: 5, gap: 10},
    sectionLabel: {
        width: '100%',
        backgroundColor: '#00000050',
        paddingVertical: 5,
        borderRadius: 20,
        alignItems: 'center',
    },
    sectionLabelFirst: {marginTop: 5},
    sectionLabelSecond: {marginTop: 30},

    coinRow: {flexDirection: 'row', alignItems: 'center', gap: 5},
    coinText: {fontFamily: Font.black, fontSize: 14},
    adsValueRow: {flexDirection: 'row', alignItems: 'center'},

    timerRoot: {width: '100%', alignItems: 'center'},
    timerCircleBox: {width: 120, height: 120, alignItems: 'center', justifyContent: 'center'},
    timerWaveLayer: {position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'},
    timerProgressLayer: {position: 'absolute'},
});

export default FreeCoin;