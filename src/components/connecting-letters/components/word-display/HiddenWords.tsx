import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, I18nManager, Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import Font from '../../../../utils/Font';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../redux/store/RootReducer';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    withTiming,
    Easing,
    withDelay // 1. اضافه کردن withDelay
} from 'react-native-reanimated';
import Modal from 'react-native-modal';
import { IS_TABLET_CONDITION } from '../../../../utils/constants/constants';
import SimpleBorderText from '../../../text-components/SimpleBorderText';
import LocalImageComponent from '../../../image-components/LocalImageComponent';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import { priceDigitSeperator } from '../../../../utils/PriceDigitSeperator';
import WoodProgressBar from '../../../WoodProgressBar';
import TextGradientSvg from '../../../text-components/TextGradientSvg';
import Toast from '../../../custom-toast/Toast';
import { AppDispatch } from '../../../../redux/store/Store';
import { convertHiddenWordsToCoin } from '../../../../redux/slices/hiddenWordSlice';
import { increaseNumberCoins } from '../../../../redux/slices/coinSlice';

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);


const { width, height } = Dimensions.get('screen');
const MINIMUM_NUMBER_OF_NEW_HIDDEN_WORD = 42
const HiddenWords = () => {
    const dispatch = useDispatch<AppDispatch>();
    const colors = useAppTheme();
    const { newHiddenWords, totalHiddenWords } = useSelector((state: RootState) => state.hiddenWords);
    const prevCountRef = useRef(newHiddenWords);
    const localToastRef = useRef<any>(null);
    const [visible, setVisible] = useState(false)
    const contentWidth = IS_TABLET_CONDITION ? 460 : width - 40;
    const contentHeight = height * 0.6
    const REWARD = Math.round(newHiddenWords * 1.42);

    // --- انیمیشن آیکون کلمات پنهان (قبلی) ---
    const scale = useSharedValue(1);
    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const triggerSpringAnimation = () => {
        scale.value = 1;
        scale.value = withSequence(
            withTiming(0.7, {
                duration: 300,
                easing: Easing.out(Easing.quad)
            }),
            withSpring(1, {
                damping: 3,
                stiffness: 150,
                mass: 1.5
            })
        );
    };

    // --- 2. انیمیشن جدید برای سکه (Reward) ---
    const rewardScale = useSharedValue(1);
    const rewardOpacity = useSharedValue(1);

    const rewardAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: rewardScale.value }],
            opacity: rewardOpacity.value,
        };
    });

    const triggerRewardAnimation = () => {
        // ریست کردن مقادیر قبل از شروع
        rewardScale.value = 1;
        rewardOpacity.value = 1;

        // مرحله 1: بزرگ شدن آرام در طول 2 ثانیه
        rewardScale.value = withTiming(4, { 
            duration: 1500, 
            easing: Easing.out(Easing.quad) 
        });

        // مرحله 2: بعد از 2 ثانیه تاخیر، محو شود
        rewardOpacity.value = withDelay(2000, withTiming(0, { duration: 500 }));
    };

    useEffect(() => {
        if (newHiddenWords > prevCountRef.current) {
            triggerSpringAnimation();
        }
        prevCountRef.current = newHiddenWords;
    }, [newHiddenWords]);

    const open = () => {
        setVisible(true)
        triggerSpringAnimation()
    }

    const close = () => {
        setVisible(false)
        // ریست کردن انیمیشن سکه هنگام بستن مودال برای استفاده مجدد
        rewardScale.value = 1;
        rewardOpacity.value = 1;
    }

    const convert = () => {
        if (newHiddenWords < MINIMUM_NUMBER_OF_NEW_HIDDEN_WORD) {
            if (localToastRef.current) {
                localToastRef.current.show({
                    title: "دریافت سکه",
                    message: "تعداد کلمات پنهان جدید، کمتر از حد نصاب برای تبدیل به سکه می‌باشد.",
                    type: 'error',
                    animationType: 'slide',
                    position: 'top'
                });
            }
        } else {
            triggerRewardAnimation();
            setTimeout(()=>{
                dispatch(convertHiddenWordsToCoin())
                dispatch(increaseNumberCoins({ number: REWARD }))
            }, 2500);
        }
    }

    return (
        <View>
            <TouchableOpacity onPress={open} activeOpacity={0.6}>
                <AnimatedImageBackground
                    source={require("../../../../assets/image/card_1.png")}
                    style={[
                        { width: 40, height: 52, justifyContent: "center", alignItems: "center" },
                        rStyle
                    ]}
                    imageStyle={{ resizeMode: "stretch" }}
                    resizeMode="stretch"
                >
                    <Text style={{ fontFamily: Font.bakh_semi_bold, fontSize: 9, color: colors.primary.a5 }}>{"کلمات"}</Text>
                    <Text style={{ fontFamily: Font.bakh_semi_bold, fontSize: 9, color: colors.primary.a5 }}>{"پنهان"}</Text>
                </AnimatedImageBackground>
            </TouchableOpacity>
            <Modal
                animationIn={'fadeIn'}
                animationOut={'fadeOut'}
                backdropOpacity={0.5}
                isVisible={visible}
                onBackdropPress={close}
                deviceHeight={height}
                statusBarTranslucent={true}
                coverScreen={true}
                useNativeDriverForBackdrop={true}
                onBackButtonPress={close}
                style={{ direction: I18nManager.isRTL ? 'rtl' : 'ltr', }}
            >
                <Toast ref={localToastRef} defaultPosition="top" />
                <View style={{ alignItems: "center", justifyContent: "center" }}>

                    <ImageBackground
                        source={require("../../../../assets/image/paper_frame.png")}
                        style={{ width: contentWidth, height: contentHeight, alignItems: 'center', justifyContent: 'center' }}
                        imageStyle={{ resizeMode: "stretch" }}
                        resizeMode="stretch"
                    >
                        <View style={{ width: contentWidth, height: contentHeight, alignItems: "center", paddingHorizontal: 40, paddingVertical: 40, justifyContent: "space-between" }}>
                            <View style={{ width: "100%" }}>
                                <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', gap: 5 }}>
                                    <Text style={{ fontFamily: Font.black, fontSize: 18, color: colors.primary.a2 }}>{"کل کلمات پنهان:"}</Text>
                                    <Text style={{ fontFamily: Font.black, fontSize: 22, color: colors.primary.a4 }}>{priceDigitSeperator(totalHiddenWords)}</Text>
                                </View>
                                <Text style={{ fontFamily: Font.bakh_semi_bold, color: "#444444", fontSize: 9, textAlign: 'justify' }}>{"کل کلمات پنهانی که شما تاکنون در این حساب کاربری، در مراحل و چالش‌های مختلف، ایجاد کرده اید."}</Text>
                                <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row', gap: 5, marginTop: 5 }}>
                                    <Text style={{ fontFamily: Font.black, fontSize: 18, color: colors.primary.a2 }}>{"کلمات پنهان جدید:"}</Text>
                                    <Text style={{ fontFamily: Font.black, fontSize: 22, color: colors.primary.a4 }}>{priceDigitSeperator(newHiddenWords)}</Text>
                                </View>
                                <Text style={{ fontFamily: Font.bakh_semi_bold, color: "#444444", fontSize: 9, textAlign: 'justify' }}>{"تعداد کلمات پنهانی که اخیرا ایجاد کرده‌اید و می‌توانید آن‌ها را تبدیل به سکه کنید."}</Text>
                            </View>
                            <View style={{ width: "100%", alignItems: 'center', gap: 10 }}>
                                <WoodProgressBar
                                    progressWidth={contentWidth - 80}
                                    progress={newHiddenWords}
                                    maxValue={MINIMUM_NUMBER_OF_NEW_HIDDEN_WORD}
                                    showValue={true}
                                />
                                
                                {/* --- 4. اعمال Animated.View و استایل انیمیشن --- */}
                                <Animated.View style={[
                                    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: 30, zIndex:1000 },
                                    rewardAnimatedStyle // اضافه کردن استایل انیمیشن
                                ]}>
                                    <Image
                                        style={{ width: 25, height: 25, opacity: newHiddenWords < MINIMUM_NUMBER_OF_NEW_HIDDEN_WORD ? 0.3 : 1 }}
                                        source={require('../../../../assets/image/coin.png')}
                                    />
                                    <Text style={{ fontFamily: Font.black, fontSize: 18, color: newHiddenWords < MINIMUM_NUMBER_OF_NEW_HIDDEN_WORD ? `${colors.primary.a4}30` : colors.primary.a4 }}>{REWARD > 0 ? `${priceDigitSeperator(REWARD)}+` : ""}</Text>
                                </Animated.View>

                                <TouchableOpacity activeOpacity={0.8} onPress={convert} style={{ width: 200, height: 55, alignItems: 'center', justifyContent: 'center' }}>
                                    <ImageBackground
                                        source={require("../../../../assets/image/ads_btn_blu.png")}
                                        style={{ width: 200, height: 55, alignItems: 'center', justifyContent: 'center', paddingBottom: 5 }}
                                        imageStyle={{ resizeMode: "stretch" }}
                                        resizeMode="stretch"
                                    >
                                        <TextGradientSvg
                                            text={"تبدیل به سکه"}
                                            fontFamily={Font.bakh_extra_bold}
                                            fontSize={18}
                                            colors={["#FFFFFF", "#fff5c8"]}
                                            shadowColor={"#00000090"}
                                            shadowBlur={5}
                                            dropShadow={true}
                                            borderColor={"#000000"}
                                            borderWidth={1}
                                            glowBlur={100}
                                            glowColor={'#fff5c8'}
                                            glowShadow={true}
                                        />
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ImageBackground>
                    <View style={{ alignItems: 'center', alignSelf: 'center', position: 'absolute', top: -40 }}>
                        <ImageBackground
                            source={require("../../../../assets/image/header_title_frame.png")}
                            style={{ width: contentWidth - 100, height: 70, alignItems: 'center', justifyContent: 'center', paddingBottom: 10 }}
                            imageStyle={{ resizeMode: "stretch" }}
                            resizeMode="stretch"
                        >
                            <SimpleBorderText
                                text={"کلمات پنهان"}
                                width={contentWidth - 100}
                                height={22 * 1.6}
                                fontSize={22}
                                textColor={colors.primary.a5}
                                borderColor={"#4d2719"}
                            />
                        </ImageBackground>
                        <View style={{ width: contentWidth, alignItems: 'flex-start', position: 'absolute' }}>
                            <TouchableOpacity activeOpacity={0.9} onPress={close} style={{ start: -10, top: 25 }}>
                                <ImageBackground
                                    source={require("../../../../assets/image/circle_button2.png")}
                                    style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center', paddingBottom: 5 }}
                                    imageStyle={{ resizeMode: "stretch" }}
                                    resizeMode="stretch"
                                >
                                    <LocalImageComponent
                                        path={require("../../../../assets/image/close_in_wood.png")}
                                        width={20}
                                        height={20}
                                        resizeMode="stretch"
                                        blank_background
                                    />
                                </ImageBackground>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default React.memo(HiddenWords);