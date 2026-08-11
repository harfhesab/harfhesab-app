import React, { useState, useImperativeHandle, memo, useCallback } from 'react';
import { View, Dimensions, TouchableOpacity, Text, I18nManager, Image, ImageBackground, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import Font from '../../utils/Font';
import AdsButton from '../buttons/AdsButton';
import DynamicProSkiaText from '../text-components/DynamicProSkiaText';
import LottieView from 'lottie-react-native';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { useDispatch } from "react-redux";
import { increaseNumberCoins } from '../../redux/slices/coinSlice';
import { IS_TABLET_CONDITION } from '../../utils/constants/constants';

const { width, height } = Dimensions.get('screen');

// کش کردن فایل‌های استاتیک
const ASSETS = {
    paperFrame: require("../../assets/image/paper_frame.png"),
    coin: require('../../assets/image/coin.png'),
    diamond: require('../../assets/image/diamond.png'),
    headerTitleFrame: require("../../assets/image/header_title_frame.png"),
    btnGreen: require("../../assets/image/paper_frame_btn_green.png"),
    longBtnGreen: require("../../assets/image/paper_frame_long_btn_green.png"),
    lottieSuccess: require('../../assets/lottie/successful.json'),
    lottieUnlocked: require('../../assets/lottie/unlocked.json')
};



const GameAlert = React.forwardRef((props, ref) => {
    const colors = useAppTheme();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState(null)
    const [visible, setVisible] = useState(false);
    const [data, setData] = useState({
        cancelable: false, buttons: null, title: null,
        admiration: null, description: null, moreDescription: null,
        completedSentences: null, stageHint: null, reward: null, subscription: null,
        lottie: null // 'success' | 'unlocked' | null
    });

    const open = useCallback((dialog) => {
        setVisible(true);
        // تاخیر 200 میلی‌ثانیه برای جلوگیری از فریز شدن ترد UI در زمان باز شدن مودال
        setTimeout(() => {
            setData({
                title: dialog?.title || null,
                admiration: dialog?.admiration || null,
                description: dialog?.description || null,
                moreDescription: dialog?.moreDescription || null,
                completedSentences: dialog?.completedSentences || null,
                stageHint: dialog?.stageHint || null,
                cancelable: dialog?.options?.cancelable || false,
                buttons: dialog?.buttons || null,
                reward: dialog?.options?.reward || null,
                subscription: dialog?.options?.subscription || null,
                lottie: dialog?.options?.lottie || null
            });

            if (dialog?.options?.reward > 0 && dialog.options?.isRewardDisabled !== true) {
                dispatch(increaseNumberCoins({ number: dialog.options.reward }));
            }
        }, 200);
    }, [dispatch]);

    const close = useCallback(() => {
        setVisible(false);
        setTimeout(() => {
            setData({
                cancelable: false, buttons: null, title: null, admiration: null,
                description: null, moreDescription: null, completedSentences: null,
                stageHint: null, reward: null, subscription: null, lottie: null
            });
            setLoading(false)
            setLoadingMessage(null)
        }, 400); // پاک کردن دیتا پس از پایان انیمیشن خروج مودال
    }, []);

    const changeLoading = useCallback((dialog) => {
        setLoading(dialog?.loadingValue ?? false)
        setLoadingMessage(dialog?.loadingMessage ?? null)
    }, []);

    const changeButtons = useCallback((dialog) => {
        setData(prev => ({
            ...prev,
            buttons: dialog?.buttons
        }));
    }, [])

    useImperativeHandle(ref, () => ({
        open, changeLoading, changeButtons
    }), [open, changeLoading, changeButtons]);

    const handleBackdropPress = useCallback(() => {
        if (data.cancelable) close();
    }, [data.cancelable, close]);

    const contentWidth = IS_TABLET_CONDITION ? 460 : width * 0.95;

    // اندازه‌ها کاملاً از روی وجود داده‌ی واقعی مشتق می‌شوند، نه یک "type" دستی
    const hasSentencesList = !!data.completedSentences?.length;
    const hasRewards = !!(data.reward || data.subscription);
    const isUnlockedLottie = data.lottie === 'unlocked';
    let lottieSource = null;
    if (data.lottie === 'success') lottieSource = ASSETS.lottieSuccess;
    else if (data.lottie === 'unlocked') lottieSource = ASSETS.lottieUnlocked;

    const cardMaxHeight = height * 0.85;
    const cardMinHeight = height * 0.4;
    const scrollMaxHeight = hasSentencesList ? height * 0.3 : height * 0.2; // کمی بیشتر شد
    const scrollMinHeight = height * 0.15;

    return (
        <Modal
            animationIn={'fadeIn'}
            animationOut={'fadeOut'}
            backdropOpacity={0.5}
            isVisible={visible}
            onBackdropPress={handleBackdropPress}
            deviceHeight={height}
            statusBarTranslucent={true}
            coverScreen={true}
            useNativeDriverForBackdrop={true}
            onBackButtonPress={handleBackdropPress}
        >
            <View style={styles.outer}>
                <ImageBackground
                    source={ASSETS.paperFrame}
                    style={{
                        width: contentWidth,
                        minHeight: cardMinHeight,
                        maxHeight: cardMaxHeight,
                    }}
                    imageStyle={styles.stretch}
                    resizeMode="stretch"
                >
                    <View style={[styles.card, { paddingTop: 20 }]}>

                        {/* بخش بالا: لاتی + جوایز */}
                        <View style={styles.topSection}>
                            {!!lottieSource && (
                                <View style={{ padding: isUnlockedLottie ? 30 : 0 }}>
                                    <LottieView
                                        style={{ width: contentWidth * 0.7, height: isUnlockedLottie ? height * 0.13 : height * 0.2 }}
                                        source={lottieSource}
                                        autoPlay
                                        loop={false}
                                    />
                                </View>
                            )}

                            {hasRewards && (
                                <View style={styles.rewardsRow}>
                                    {!!data.reward && (
                                        <View style={[styles.rewardBadge, { backgroundColor: `${colors.primary.a8}40` }]}>
                                            <Image style={styles.rewardIcon} source={ASSETS.coin} />
                                            <Text style={[styles.rewardText, { color: colors.primary.a8 }]}>{`${data.reward}+`}</Text>
                                        </View>
                                    )}
                                    {!!data.subscription && (
                                        <View style={[styles.rewardBadge, { backgroundColor: `${colors.primary.a8}40` }]}>
                                            <Image style={styles.rewardIcon} source={ASSETS.diamond} />
                                            <Text style={[styles.rewardText, { color: colors.primary.a8 }]}>{`${data.subscription}+`}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* بخش میانی: محتوا یا پیام لودینگ */}
                        {!loadingMessage ? (
                            <View style={[
                                styles.scrollWrapper,
                                {
                                    maxHeight: scrollMaxHeight,
                                    minHeight: scrollMinHeight,
                                    width: "90%",
                                    backgroundColor: `${colors.primary.a7}40`
                                }
                            ]}>
                                <ScrollView
                                    style={styles.scrollView}
                                    showsVerticalScrollIndicator={true}
                                    contentContainerStyle={{ width: '100%', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12 }}
                                >
                                    {!!data.admiration && (
                                        <View style={styles.admirationBox}>
                                            <Text style={[styles.admirationText, { color: colors.primary.a8 }]}>{data.admiration}</Text>
                                        </View>
                                    )}
                                    {!!data.description && <Text style={[styles.descText, { color: colors.primary.a8 }]}>{data.description}</Text>}
                                    {!!data.moreDescription && <Text style={[styles.moreDescText, { color: colors.primary.a7 }]}>{data.moreDescription}</Text>}

                                    {hasSentencesList && (
                                        <View style={styles.sentencesContainer}>
                                            {data.completedSentences.map((item, index) => (
                                                <View key={index.toString()} style={styles.sentenceItem}>
                                                    <Text style={[styles.sentenceMainText, { color: colors.primary.a2 }]}>
                                                        <Text style={{ color: colors.primary.a8 }}>{`${index + 1}_ `}</Text>
                                                        {item?.sentence}
                                                    </Text>
                                                    {!!item?.hint && (
                                                        <Text style={[styles.sentenceHintText, { color: colors.primary.a7 }]}>
                                                            <Text style={{ color: `${colors.primary.a7}99` }}>{"معنی : "}</Text>
                                                            {item?.hint}
                                                        </Text>
                                                    )}
                                                </View>
                                            ))}
                                            {!!data.stageHint && (
                                                <View style={styles.stageHintContainer}>
                                                    <Text style={[styles.stageHintText, { color: colors.primary.a7 }]}>
                                                        <Text style={{ color: `${colors.primary.a7}99` }}>{"توضیحات : "}</Text>
                                                        {data.stageHint}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        ) : (
                            <View style={styles.loadingBox}>
                                <Text style={{ fontFamily: Font.bakh_bold, fontSize: 14, textAlign: 'center' }}>{loadingMessage}</Text>
                            </View>
                        )}

                        {/* بخش پایین: دکمه‌ها */}
                        {!!data.buttons?.length && (
                            <View style={styles.buttonsContainer}>
                                {data.buttons.map((item, index) => {
                                    if (item?.type === "bold") {
                                        const isMultiBtn = data.buttons.length > 1;
                                        return (
                                            <TouchableOpacity
                                                key={index.toString()}
                                                activeOpacity={0.9}
                                                onPress={() => {
                                                    item.onPress();
                                                    if (!item?.preventClose) {
                                                        close();
                                                    }
                                                }}
                                            >
                                                <ImageBackground
                                                    source={isMultiBtn ? ASSETS.btnGreen : ASSETS.longBtnGreen}
                                                    style={[styles.actionBtnBg, { width: isMultiBtn ? contentWidth * 0.28 : 150 }]}
                                                    imageStyle={styles.stretch}
                                                    resizeMode="stretch"
                                                >
                                                    {
                                                        loading == true ?
                                                            <ActivityIndicator color={colors.primary.a3} size={'small'} />
                                                            :
                                                            <DynamicProSkiaText
                                                                text={item.text || " "}
                                                                textColor={colors.primary.a3}
                                                                borderColor={colors.primary.a7}
                                                                borderWidth={1}
                                                                fontSize={18}
                                                                fontName={"YekanBakh-ExtraBold"}
                                                            />
                                                    }
                                                </ImageBackground>
                                            </TouchableOpacity>
                                        );
                                    }
                                    if (item?.type === "ads") {
                                        return (
                                            <AdsButton
                                                key={index.toString()}
                                                onPress={item?.onPress}
                                                hideAction={() => {
                                                    setData(prev => ({
                                                        ...prev,
                                                        buttons: prev.buttons?.filter(b => b.type !== "ads") || []
                                                    }));
                                                }}
                                                width={contentWidth * 0.5}
                                                reward={item?.reward}
                                                adsPosition={item?.adsPosition}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </View>
                        )}
                    </View>
                </ImageBackground>

                <View style={styles.headerContainer}>
                    <ImageBackground
                        source={ASSETS.headerTitleFrame}
                        style={[styles.headerBg, { width: contentWidth - 20 }]}
                        imageStyle={styles.stretch}
                        resizeMode="stretch"
                    >
                        <DynamicProSkiaText
                            text={data.title || " "}
                            textColor={colors.primary.a5}
                            borderColor={colors.primary.a7}
                            borderWidth={1}
                            fontSize={22}
                        />
                    </ImageBackground>
                </View>
            </View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    outer: {
        direction: I18nManager.isRTL ? 'rtl' : 'ltr',
        alignItems: "center",
        justifyContent: "center",
    },
    stretch: { resizeMode: "stretch" },
    card: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 70,
    },
    topSection: {
        width: '100%',
        alignItems: 'center',
    },
    rewardsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom:15
    },
    rewardBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 6,
    },
    rewardIcon: { width: 20, height: 20 },
    rewardText: { fontSize: 18, fontFamily: Font.bakh_black },
    scrollWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 16,
    },
    scrollView: { flexGrow: 0, width: '100%' },
    loadingBox: {
        width: '100%',
        minHeight: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    admirationBox: {
        alignSelf: 'center',
        backgroundColor: "#FFFFFF50",
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    admirationText: { fontFamily: Font.bakh_black, fontSize: 20, textAlign: 'center' },
    descText: { fontFamily: Font.bakh_extra_bold, fontSize: 15, textAlign: 'justify', lineHeight: 27 },
    moreDescText: { fontFamily: Font.bakh_semi_bold, fontSize: 10, textAlign: 'justify', marginTop: 15, lineHeight: 18 },
    sentencesContainer: { width: "100%", gap: 10, paddingTop: 15 },
    sentenceItem: { width: "100%" },
    sentenceMainText: { fontFamily: Font.bakh_extra_bold, fontSize: 16 },
    sentenceHintText: { fontFamily: Font.bakh_bold, fontSize: 14, marginTop: 4 },
    stageHintContainer: { width: "100%", alignItems: 'flex-start' },
    stageHintText: { fontFamily: Font.bakh_bold, fontSize: 12, lineHeight: 26, marginTop: 15 },
    buttonsContainer: {
        width: "100%",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    actionBtnBg: { height: 55, alignItems: 'center', justifyContent: 'center', paddingBottom: 5 },
    headerContainer: { alignSelf: 'center', position: 'absolute', top: -30, zIndex: 10 },
    headerBg: { height: 70, alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }
});

export default memo(GameAlert);