import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {NativeModules, ScrollView, StyleSheet, View, useWindowDimensions} from 'react-native';
import useAppTheme from '../../hooks/theme/useAppTheme';
import GeneralHeader from '../../components/header/GeneralHeader';
import {CARDS, GAP, PADDING} from '../../components/home-parts/homeConfig';
import {getHomeLayout, getCardSpec} from '../../components/home-parts/homeGeometry';
import useSceneClock from '../../components/home-parts/useSceneClock';
import DustBackdrop from '../../components/home-parts/components/DustBackdrop';
import ContinueButton from '../../components/home-parts/components/ContinueButton';
import GameCard from '../../components/home-parts/components/GameCard';
import AdRewardButton from '../../components/home-parts/components/AdRewardButton';
import {getRewardAdsStatusForHomeScreen, registerRewardAdWatch} from '../../utils/adsLimitStorage';
import {TapsellLegacyAdapter} from '@react-native-tapsell-mediation/legacy';
import {CompletionState, requestRewardedAd, showRewardedAd} from '@react-native-tapsell-mediation/tapsell';
import AlertBottomDrawerHelper from '../../components/alert-bottom-drawer/AlertBottomDrawerHelper';
import {showToast} from '../../components/custom-toast/ToastRef';
import FullScreenLoadingHelper from '../../components/full-screen-loading/FullScreenLoadingHelper';
import {useDispatch, useSelector} from 'react-redux';
import {tapsell} from '../../utils/constants/tapsell';
import {increaseNumberCoins} from '../../redux/slices/coinSlice';
import Font from '../../utils/Font';
import LocalImageComponent from '../../components/image-components/LocalImageComponent';
import {useFocusEffect} from '@react-navigation/native';
import Icon from '../../utils/Icon';
import {
  registerLaunch,
  shouldAskForRating,
  markPromptShown,
  markRated,
} from '../../utils/ratingScheduler';
import { TARGET_STORE } from '../../utils/constants/build-config';

/* ═════════════ ثابت‌ها ═════════════ */
const HEADER_HEIGHT = 60;

const AD_LOAD_ERROR_MESSAGE =
    'مشکلی در بارگذاری ویدیو پیش آمد. اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.';
const AD_LIMIT_MESSAGE = 'در حال حاضر نمایش ویدیو محدود شده است.';
const AD_SKIPPED_MESSAGE = 'برای دریافت سکه، باید ویدیو را تا انتها تماشا کنید.';

const showAdToast = message =>
    showToast({
        title: 'مشکلی پیش آمد',
        message,
        type: 'error',
        animationType: 'slide',
        position: 'top',
        duration: 5000,
    });

const {CafeBazaar, Myket} = NativeModules;
function Home(props) {
    const colors = useAppTheme();
    const dispatch = useDispatch();
    // فقط همین یک فیلد انتخاب می‌شود تا با تغییر بقیه‌ی constants این صفحه دوباره رندر نشود
    const coinReward = useSelector(state => state.constants.free_coin_view_ads);
    const {
        continueGameType,
        continueGameId,
    } = useSelector((state) => state.setting);

    const [adsStatus, setAdsStatus] = useState({allowed: false});
    const {width, height: windowHeight} = useWindowDimensions(); // با تا/باز شدن Fold آپدیت می‌شود
    const [body, setBody] = useState({w: width, h: windowHeight});
    const adBusyRef = useRef(false); // جلوگیری از درخواست هم‌زمان تبلیغ (دابل‌تپ)

    const time = useSceneClock(props.navigation);
    const layout = useMemo(() => getHomeLayout(width), [width]);

    const navigate = useCallback(route => props.navigation.navigate(route), [props.navigation]);

    useEffect(() => {
        (async () => {
            await registerLaunch();
            if (await shouldAskForRating()) {
                await markPromptShown();
                showRatingDialog();
            }
        })();
    }, []);

    const showRatingDialog = ()=>{
        const btn = [
            {
                onPress : async()=>{
                    openStorePage();
                },
                text: "امتیاز می‌دهم",
                loading: false,
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
                text:"آیا از بازی راضی هستی؟",
                style:{ maxWidth:width-65, fontFamily:Font.bakh_bold, fontSize:22, color:colors.primary.a3, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
            },
            {
                text:"اگر بازی «حرف حساب» را دوست داشتی، با ثبت امتیاز از ما حمایت کن.",
                style:{ maxWidth:width-30, fontFamily:Font.bakh_semi_bold, fontSize:15, color:colors.text.a2, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
            },
            {
                text:"عملیات ثبت امتیاز حداکثر 10 ثانیه طول می‌کشد.",
                style:{ maxWidth:width-30, fontFamily:Font.bakh_semi_bold, fontSize:15, color:colors.text.a6, alignSelf:'flex-start', textAlign:'justify', lineHeight:30},
            },
        ]
        AlertBottomDrawerHelper.showAlert({
            title:"ثبت امتیاز",
            message: msg,
            buttons:btn,
            options:{
                cancelable: true,
                icon:{
                    Icon:()=>(
                        <View style={{width:"100%", flexDirection:'row', alignItems:'flex-end', justifyContent:'center', gap:5}}>
                            <LocalImageComponent
                                path={require("../../assets/image/star.png")}
                                width={47.5}
                                height={50}
                                resizeMode="stretch"
                                blank_background
                                style={{marginBottom:6}}
                            />
                            <LocalImageComponent
                                path={require("../../assets/image/star.png")}
                                width={76}
                                height={80}
                                resizeMode="stretch"
                                blank_background
                            />
                            <LocalImageComponent
                                path={require("../../assets/image/star.png")}
                                width={47.5}
                                height={50}
                                resizeMode="stretch"
                                blank_background
                                style={{marginBottom:6}}
                            />
                        </View>
                    )
                }
            }
        })
    }

    const handleCafeBazaarRating = useCallback(async () => {
        try {
            const success = await CafeBazaar.openRating();
            if (success) {
                await markRated();
            }
        } catch (error) {
            showErrorToast('خطایی در باز کردن کافه‌ بازار پیش آمد. یا اینکه کافه بازار نصب نیست.', 4000);
        }
    }, []);

    const handleMyketRating = useCallback(async () => {
        try {
            const success = await Myket.openRating();
            if (success) {
                await markRated();
            }
        } catch (error) {
            if (error.code === 'E_MYKET_NOT_INSTALLED') {
                showErrorToast('تا زمانی که مایکت نصب نباشد ثبت نظر و امتیاز ممکن نیست.', 4000);
            } else {
                showErrorToast('خطایی در باز کردن مایکت پیش آمد.', 4000);
            }
        }
    }, []);

    const openStorePage = useCallback(async () => {
        if (TARGET_STORE == 'cafebazaar') {
            await handleCafeBazaarRating();
        } else if (TARGET_STORE == 'myket') {
            await handleMyketRating();
        }
    }, [handleCafeBazaarRating, handleMyketRating]);

    /* ═════════════ وضعیت محدودیت تبلیغ ═════════════ */
    useEffect(() => {
        TapsellLegacyAdapter.register();
    }, []);

    useFocusEffect(
        useCallback(() => {
            let alive = true;
            getRewardAdsStatusForHomeScreen()
                .then(status => alive && setAdsStatus(status))
                .catch(() => {});
            return () => {
                alive = false;
            };
        }, []),
    );

    const registerLocalHistoryAds = useCallback(async () => {
        try {
            setAdsStatus(await registerRewardAdWatch());
        } catch (e) {}
    }, []);

    /* ═════════════ آلرت‌ها (یک‌بار تعریف، چندجا استفاده) ═════════════ */
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

    const renderErrorIcon = useCallback(
        () => <Icon name={'error-outline'} type={'MaterialIcons'} style={{color: colors.alert.a1, fontSize: 50}} />,
        [colors.alert.a1],
    );

    const renderCoinIcon = useCallback(
        () => (
            <View style={{width, alignItems: 'center'}}>
                <LocalImageComponent
                    path={require('../../assets/image/coin.png')}
                    width={80}
                    height={80}
                    resizeMode={'stretch'}
                    blank_background={true}
                />
            </View>
        ),
        [width],
    );

    const showCoinAlert = useCallback(
        (text, renderIcon) => {
            AlertBottomDrawerHelper.showAlert({
                title: 'دریافت سکه',
                message: [{text, style: alertTextStyle}],
                buttons: [
                    {
                        onPress: () => {},
                        text: 'متوجه شدم',
                        loading: false,
                        stayOpen: false,
                        type: 'bold',
                    },
                ],
                options: {
                    cancelable: true,
                    icon: {Icon: renderIcon},
                },
            });
        },
        [alertTextStyle],
    );

    /* ═════════════ نمایش تبلیغ پاداشی ═════════════ */
    const presentRewardedAd = useCallback(
        id => {
            let rewarded = false; // محافظ: پاداش در هر نمایش فقط یک‌بار
            showRewardedAd(id, {
                onAdImpression: () => {},
                onAdClicked: () => {},
                onRewarded: () => {
                    if (rewarded) {
                        return;
                    }
                    rewarded = true;
                    dispatch(increaseNumberCoins({number: coinReward}));
                    registerLocalHistoryAds();
                    showCoinAlert(`تعداد ${coinReward} سکه با موفقیت به حساب کاربری شما اضافه شد.`, renderCoinIcon);
                },
                onAdClosed: completionState => {
                    adBusyRef.current = false;
                    if (CompletionState[completionState] === 'SKIPPED') {
                        showCoinAlert(AD_SKIPPED_MESSAGE, renderErrorIcon);
                    }
                },
                onAdFailed: () => {
                    adBusyRef.current = false;
                    showCoinAlert(AD_LOAD_ERROR_MESSAGE, renderErrorIcon);
                },
            });
        },
        [dispatch, coinReward, registerLocalHistoryAds, showCoinAlert, renderCoinIcon, renderErrorIcon],
    );

    const requestShowAd = useCallback(async () => {
        if (adBusyRef.current) {
            return;
        }
        adBusyRef.current = true;

        try {
            const status = await getRewardAdsStatusForHomeScreen();
            if (!status?.allowed) {
                showAdToast(AD_LIMIT_MESSAGE);
                adBusyRef.current = false;
                return;
            }

            FullScreenLoadingHelper.showLoading({title: 'در حال بارگذاری...', cancelable: false});

            let id;
            try {
                id = await requestRewardedAd(tapsell.position.get_free_coin.zone_id);
            } catch (e) {
                FullScreenLoadingHelper.hideLoading();
                showAdToast(AD_LOAD_ERROR_MESSAGE);
                adBusyRef.current = false;
                return;
            }
            FullScreenLoadingHelper.hideLoading();

            if (!id) {
                adBusyRef.current = false;
                showCoinAlert(AD_LOAD_ERROR_MESSAGE, renderErrorIcon);
                return;
            }

            // قفل تا onAdClosed / onAdFailed باز نمی‌شود
            presentRewardedAd(id);
        } catch (e) {
            FullScreenLoadingHelper.hideLoading();
            adBusyRef.current = false;
        }
    }, [presentRewardedAd, showCoinAlert, renderErrorIcon]);

    const onBodyLayout = useCallback(e => {
        const {width: w, height: h} = e.nativeEvent.layout;
        setBody(prev => (prev.w === w && prev.h === h ? prev : {w, h}));
    }, []);

    const showAdButton = adsStatus?.allowed !== false;

    return (
        <View style={{flex: 1, backgroundColor: colors.background.a1}}>
            <View style={styles.body} onLayout={onBodyLayout}>
                <DustBackdrop width={body.w} height={body.h} base={colors.background.a1} time={time} />
                <ScrollView
                    bounces={false}
                    overScrollMode="never"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>
                    <View style={[styles.content, {width: layout.contentWidth}]}>
                        {
                            (continueGameType && continueGameId)&&
                            <ContinueButton
                                width={layout.contentWidth}
                                time={time}
                            />
                        }
                        <View style={styles.grid}>
                            {showAdButton ? (
                                <AdRewardButton
                                    width={layout.contentWidth}
                                    reward={coinReward}
                                    time={time}
                                    onPress={requestShowAd}
                                />
                            ) : null}
                            {CARDS.map(item => {
                                const spec = getCardSpec(layout, item);
                                return (
                                    <GameCard
                                        key={item.id}
                                        item={item}
                                        width={spec.width}
                                        height={spec.height}
                                        mode={spec.mode}
                                        time={time}
                                        onPress={navigate}
                                    />
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.header}>
                    <GeneralHeader
                        backgroundColor={'transparent'}
                        coin={true}
                        subscription={true}
                        shadowColor={'transparent'}
                        borderBottomColor={'transparent'}
                        borderBottomWidth={0}
                        height={HEADER_HEIGHT}
                        notification={true}
                        account={true}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    body: {flex: 1},
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#00000050',
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: PADDING,
        paddingBottom: PADDING * 2,
        paddingTop: HEADER_HEIGHT + 10, // زیر هدر شناور
    },
    content: {gap: GAP},
    grid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: GAP},
});

export default Home;