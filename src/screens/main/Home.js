import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View, useWindowDimensions} from 'react-native';
// ScrollView از gesture-handler: تا اسکرول و برداشتن کارت (GameCard) درست از هم تفکیک شوند
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';
import useAppTheme from '../../hooks/theme/useAppTheme';
import GeneralHeader from '../../components/header/GeneralHeader';
import {CARDS, GAP, IS_RTL, PADDING} from '../../components/home-parts/homeConfig';
import {getHomeLayout, getCardSpec} from '../../components/home-parts/homeGeometry';
import useSceneClock from '../../components/home-parts/useSceneClock';
import useHomeIntro from '../../components/home-parts/useHomeIntro';
import IntroReveal from '../../components/home-parts/components/IntroReveal';
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
import useContentGate from '../../features/homeOnboarding/useContentGate';
import FirstTouchGate from '../../features/homeOnboarding/FirstTouchGate';
import showWelcomeDialog from '../../features/homeOnboarding/showWelcomeDialog';
import showDownloadDialog from '../../features/homeOnboarding/showDownloadDialog';

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

// وضعیت تبلیغ با هر برگشت به خانه دوباره خوانده می‌شود و هر بار شیء تازه است؛ اگر محتوایش
// همان قبلی باشد، state عوض نمی‌شود تا کل صفحه درست هم‌زمان با برگشتن و ساخته شدن دوباره‌ی
// سطح‌های اسکیا بی‌دلیل re-render نشود
const keepIfSame = next => prev => {
    if (!prev || !next || typeof prev !== 'object' || typeof next !== 'object') {
        return next;
    }
    const keys = Object.keys(next);
    return keys.length === Object.keys(prev).length && keys.every(k => prev[k] === next[k]) ? prev : next;
};

// کارت‌ها یکی‌درمیان از دو طرف پخش می‌شوند؛ دو کارت کوچکِ هم‌ردیف هر کدام از سمت خودشان می‌آیند
const dealSide = index => (index % 2 === 0 ? 1 : -1) * (IS_RTL ? 1 : -1);

function Home(props) {
    const colors = useAppTheme();
    const dispatch = useDispatch();
    const versionCreatedContent = useSelector(state => state.stageGamePersist.versionCreatedContent);
    const continueGameType = useSelector(state => state.setting.continueGameType);
    const continueGameId = useSelector(state => state.setting.continueGameId);
    const isStoreReady = useSelector(state => state._persist?.rehydrated ?? true);
    const hasContent = versionCreatedContent > 0;
    // فقط همین یک فیلد انتخاب می‌شود تا با تغییر بقیه‌ی constants این صفحه دوباره رندر نشود
    const coinReward = useSelector(state => state.constants.free_coin_view_ads);

    const [adsStatus, setAdsStatus] = useState({allowed: false});
    const [adsChecked, setAdsChecked] = useState(false); // تا معلوم نشده دکمه‌ی تبلیغ هست یا نه، ورود شروع نشود
    // کارت‌های برداشته‌شده {id: true}؛ فقط روی UI thread عوض می‌شود و هیچ re-render ای ندارد
    const raisedCards = useSharedValue({});
    const {width, height: windowHeight} = useWindowDimensions(); // با تا/باز شدن Fold آپدیت می‌شود
    const [body, setBody] = useState({w: width, h: windowHeight});
    const adBusyRef = useRef(false); // جلوگیری از درخواست هم‌زمان تبلیغ (دابل‌تپ)

    const time = useSceneClock(props.navigation);
    // ورود صفحه: وقتی صحنه آرام شد و داده‌های چیدمان رسیدند شروع می‌شود (intro.go و intro.clock)
    const intro = useHomeIntro(props.navigation, isStoreReady && adsChecked);
    const layout = useMemo(() => getHomeLayout(width), [width]);

    const navigate = useCallback(route => props.navigation.navigate(route), [props.navigation]);

    const handleShowWelcome = useCallback(() => {
        showWelcomeDialog({width, colors});
    }, [width, colors]);

    const handleShowDownload = useCallback(() => {
        showDownloadDialog({width, colors});
    }, [width, colors]);

    const {isGateActive, handleGatePress} = useContentGate({
        isReady: isStoreReady,
        hasContent,
        onShowWelcome: handleShowWelcome,
        onShowDownload: handleShowDownload,
    });


    /* ═════════════ وضعیت محدودیت تبلیغ ═════════════ */
    useEffect(() => {
        TapsellLegacyAdapter.register();
    }, []);

    useFocusEffect(
        useCallback(() => {
            let alive = true;
            getRewardAdsStatusForHomeScreen()
                .then(status => alive && setAdsStatus(keepIfSame(status)))
                .catch(() => {})
                .then(() => alive && setAdsChecked(true));
            return () => {
                alive = false;
            };
        }, []),
    );

    const registerLocalHistoryAds = useCallback(async () => {
        try {
            setAdsStatus(keepIfSame(await registerRewardAdWatch()));
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

    const showAdButton = hasContent && adsStatus?.allowed !== false;
    const hasContinue = Boolean(continueGameType && continueGameId);

    // صف ورود: هدر (۰) ← ادامه‌ی بازی ← تبلیغ ← کارت‌ها به ترتیب چیدمان
    const adOrder = hasContinue ? 2 : 1;
    const firstCardOrder = adOrder + (showAdButton ? 1 : 0);

    // فقط همین صفحه ریشه‌ی gesture-handler می‌گیرد؛ اگر بعداً کل اپ هم پیچیده شود،
    // این یکی خودکار غیرفعال می‌شود و مشکلی پیش نمی‌آید
    return (
        <GestureHandlerRootView style={{flex: 1, backgroundColor: colors.background.a1}}>
            <View style={styles.body} onLayout={onBodyLayout}>
                <DustBackdrop
                    width={body.w}
                    height={body.h}
                    base={colors.background.a1}
                    time={time}
                    intro={intro.clock}
                />
                <ScrollView
                    bounces={false}
                    overScrollMode="never"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>
                    <View style={[styles.content, {width: layout.contentWidth}]}>
                        {hasContinue ? (
                            <IntroReveal go={intro.go} order={1}>
                                <ContinueButton
                                    width={layout.contentWidth}
                                    time={time}
                                />
                            </IntroReveal>
                        ) : null}
                        <View style={styles.grid}>
                            {showAdButton ? (
                                <IntroReveal go={intro.go} order={adOrder}>
                                    <AdRewardButton
                                        width={layout.contentWidth}
                                        reward={coinReward}
                                        time={time}
                                        onPress={requestShowAd}
                                    />
                                </IntroReveal>
                            ) : null}
                            {CARDS.map((item, index) => {
                                const spec = getCardSpec(layout, item);
                                return (
                                    <IntroReveal
                                        key={item.id}
                                        go={intro.go}
                                        order={firstCardOrder + index}
                                        side={dealSide(index)}
                                        glint
                                        raisedCards={raisedCards}
                                        raiseKey={item.id}>
                                        <GameCard
                                            item={item}
                                            width={spec.width}
                                            height={spec.height}
                                            mode={spec.mode}
                                            time={time}
                                            // وقتی FirstTouchGate فعال است، کارت‌ها هیچ لمسی نمی‌پذیرند (اسکرول آزاد است)
                                            interactive={!isGateActive}
                                            onPress={navigate}
                                            raisedCards={raisedCards}
                                        />
                                    </IntroReveal>
                                );
                            })}
                        </View>
                    </View>
                    {isGateActive && <FirstTouchGate onPress={handleGatePress} />}
                </ScrollView>

                <IntroReveal go={intro.go} variant="drop" style={styles.header}>
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
                    {isGateActive && <FirstTouchGate onPress={handleGatePress} />}
                </IntroReveal>
            </View>
        </GestureHandlerRootView>
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