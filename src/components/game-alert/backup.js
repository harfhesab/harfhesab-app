import React, { useState, useImperativeHandle, memo, useCallback } from 'react';
import { View, Dimensions, TouchableOpacity, Text, ScrollView, I18nManager, Image, ImageBackground, StyleSheet } from 'react-native';
import Modal from '../custom-modal/Modal';
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

    const [visible, setVisible] = useState(false);
    const [data, setData] = useState({
        cancelable: false, type: "", buttons: null, title: null,
        admiration: null, description: null, moreDescription: null,
        completedSentences: null, stageHint: null, reward: null, subscription: null
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
                type: dialog?.options?.type || "",
                buttons: dialog?.buttons || null,
                reward: dialog?.options?.reward || null,
                subscription: dialog?.options?.subscription || null
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
                cancelable: false, type: "", buttons: null, title: null, admiration: null,
                description: null, moreDescription: null, completedSentences: null,
                stageHint: null, reward: null, subscription: null
            });
        }, 400); // پاک کردن دیتا پس از پایان انیمیشن خروج مودال
    }, []);

    useImperativeHandle(ref, () => ({ open }), [open]);

    const handleBackdropPress = useCallback(() => {
        if (data.cancelable) close();
    }, [data.cancelable, close]);

    const contentWidth = IS_TABLET_CONDITION ? 460 : width * 0.95;
    const isStageOrPackage = data.type === "completed-stage" || data.type === "completed-package";
    const contentHeight = isStageOrPackage ? height * 0.75 : height * 0.65;

    let lottieSource = null;
    if (data.type === 'completed-word' || isStageOrPackage) lottieSource = ASSETS.lottieSuccess;
    else if (data.type === 'completed-season') lottieSource = ASSETS.lottieUnlocked;

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
            <View style={styles.container}>
                <ImageBackground
                    source={ASSETS.paperFrame}
                    style={{ width: contentWidth, height: contentHeight, alignItems: 'center', justifyContent: 'center' }}
                    imageStyle={styles.stretch}
                    resizeMode="stretch"
                >
                    <View style={{ width: contentWidth, height: contentHeight, borderRadius: 15, alignItems: "center", justifyContent: 'space-between' }}>
                        
                        <View style={{ width: contentWidth, alignItems: 'center' }}>
                            <View style={{ padding: data.type === 'completed-season' ? 40 : 0 }}>
                                {lottieSource && (
                                    <LottieView
                                        style={{ width: contentWidth, height: data.type === 'completed-season' ? height * 0.15 : height * 0.25 }}
                                        source={lottieSource}
                                        autoPlay
                                        loop={false}
                                    />
                                )}
                            </View>
                            
                            {(data.reward || data.subscription) && (
                                <View style={styles.rewardsRow}>
                                    {data.reward && (
                                        <View style={[styles.rewardBadge, { backgroundColor: `${colors.primary.a8}40` }]}>
                                            <Image style={styles.rewardIcon} source={ASSETS.coin} />
                                            <Text style={[styles.rewardText, { color: colors.primary.a8 }]}>{`${data.reward}+`}</Text>
                                        </View>
                                    )}
                                    {data.subscription && (
                                        <View style={[styles.rewardBadge, { backgroundColor: `${colors.primary.a8}40` }]}>
                                            <Image style={styles.rewardIcon} source={ASSETS.diamond} />
                                            <Text style={[styles.rewardText, { color: colors.primary.a8 }]}>{`${data.subscription}+`}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        <View style={[
                            styles.scrollWrapper,
                            { 
                                maxHeight: isStageOrPackage ? height * 0.28 : height * 0.18, 
                                minHeight: height * 0.18, 
                                width: contentWidth * 0.8,
                                backgroundColor: `${colors.primary.a7}40`
                            }
                        ]}>
                            <ScrollView
                                style={styles.scrollView}
                                showsVerticalScrollIndicator={true}
                                contentContainerStyle={{ width: contentWidth * 0.8, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5 }}
                            >
                                {!!data.admiration && (
                                    <View style={styles.admirationBox}>
                                        <Text style={[styles.admirationText, { color: colors.primary.a8 }]}>{data.admiration}</Text>
                                    </View>
                                )}
                                {!!data.description && <Text style={[styles.descText, { color: colors.primary.a7 }]}>{data.description}</Text>}
                                {!!data.moreDescription && <Text style={[styles.moreDescText, { color: colors.primary.a7 }]}>{data.moreDescription}</Text>}
                                
                                {!!data.completedSentences?.length && (
                                    <View style={styles.sentencesContainer}>
                                        {data.completedSentences.map((item, index) => (
                                            <View key={index.toString()} style={styles.sentenceItem}>
                                                <Text style={[styles.sentenceMainText, { color: colors.primary.a2 }]}>
                                                    <Text style={[styles.sentenceNumber, { color: colors.primary.a8 }]}>{`${index + 1}_ `}</Text>
                                                    {item?.sentence}
                                                </Text>
                                                {!!item?.hint && (
                                                    <Text style={[styles.sentenceHintText, { color: colors.primary.a7 }]}>
                                                        <Text style={{ color: `${colors.primary.a7}60` }}>{"معنی : "}</Text>
                                                        {item?.hint}
                                                    </Text>
                                                )}
                                            </View>
                                        ))}
                                        {!!data.stageHint && (
                                            <View style={styles.stageHintContainer}>
                                                <Text style={[styles.stageHintText, { color: colors.primary.a7 }]}>
                                                    <Text style={{ color: `${colors.primary.a7}60` }}>{"توضیحات : "}</Text>
                                                    {data.stageHint}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </ScrollView>
                        </View>

                        {!!data.buttons?.length && (
                            <View style={[styles.buttonsContainer, { paddingBottom: isStageOrPackage ? "16%" : "14%" }]}>
                                {data.buttons.map((item, index) => {
                                    if (item?.type === "bold") {
                                        const isMultiBtn = data.buttons.length > 1;
                                        return (
                                            <TouchableOpacity
                                                key={index.toString()}
                                                activeOpacity={0.9}
                                                onPress={() => {
                                                    item.onPress();
                                                    close();
                                                }}
                                            >
                                                <ImageBackground
                                                    source={isMultiBtn ? ASSETS.btnGreen : ASSETS.longBtnGreen}
                                                    style={[styles.actionBtnBg, { width: isMultiBtn ? contentWidth * 0.28 : 150 }]}
                                                    imageStyle={styles.stretch}
                                                    resizeMode="stretch"
                                                >
                                                    <DynamicProSkiaText
                                                        text={item.text || " "}
                                                        textColor={colors.primary.a3}
                                                        borderColor={colors.primary.a7}
                                                        borderWidth={1}
                                                        fontSize={18}
                                                        fontName={"YekanBakh-ExtraBold"}
                                                    />
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
    container: { direction: I18nManager.isRTL ? 'rtl' : 'ltr', alignItems: "center", justifyContent: "center" },
    stretch: { resizeMode: "stretch" },
    rewardsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
    rewardBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 20, paddingHorizontal: 30, paddingVertical: 2, position: 'absolute', bottom: 0 },
    rewardIcon: { width: 20, height: 20 },
    rewardText: { fontSize: 20, fontFamily: Font.bakh_black },
    scrollWrapper: { justifyContent: 'center', alignItems: 'center', borderRadius: 15, overflow: 'hidden' },
    scrollView: { flexGrow: 0 },
    admirationBox: { alignSelf: 'center', backgroundColor: "#FFFFFF50", paddingHorizontal: 20, paddingVertical: 5, borderRadius: 20, marginBottom: 20, alignItems: 'center', justifyContent: 'center' },
    admirationText: { fontFamily: Font.bakh_extra_bold, fontSize: 18, textAlign: 'center' },
    descText: { fontFamily: Font.bakh_bold, fontSize: 15, textAlign: 'justify', marginTop: 5, lineHeight: 27 },
    moreDescText: { fontFamily: Font.bakh_semi_bold, fontSize: 10, textAlign: 'justify', marginTop: 15, lineHeight: 18 },
    sentencesContainer: { width: "100%", gap: 10, paddingBottom: 20, paddingTop: 10 },
    sentenceItem: { width: "100%", paddingTop: 15 },
    sentenceMainText: { fontFamily: Font.bakh_bold, fontSize: 15 },
    sentenceNumber: { fontFamily: Font.bakh_extra_bold, fontSize: 18 },
    sentenceHintText: { fontFamily: Font.bakh_semi_bold, fontSize: 12 },
    stageHintContainer: { width: "100%", alignItems: 'flex-start' },
    stageHintText: { fontFamily: Font.bakh_bold, fontSize: 14, lineHeight: 26, marginTop: 15 },
    buttonsContainer: { width: "100%", flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingStart: 15 },
    actionBtnBg: { height: 55, alignItems: 'center', justifyContent: 'center', paddingBottom: 5 },
    headerContainer: { alignSelf: 'center', position: 'absolute', top: -30 },
    headerBg: { height: 70, alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }
});

export default memo(GameAlert);