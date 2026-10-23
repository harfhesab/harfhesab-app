import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, I18nManager, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Modal from 'react-native-modal';
import Font from '../../../../utils/Font';
import { IS_TABLET_CONDITION } from '../../../../utils/constants/constants';
import { priceDigitSeperator } from '../../../../utils/PriceDigitSeperator';
import useAppTheme from '../../../../hooks/theme/useAppTheme';
import type { RootState } from '../../../../redux/store/RootReducer';
import type { AppDispatch } from '../../../../redux/store/Store';
import { convertHiddenWordsToCoin } from '../../../../redux/slices/hiddenWordSlice';
import { increaseNumberCoins } from '../../../../redux/slices/coinSlice';
import { HIDDEN_FX_IMPACT } from '../../engine/hiddenWordFx';
import { useLettersStatic } from '../../context/LettersContext';
import { onUIThread } from '../../utils/worklet';
import SimpleBorderText from '../../../text-components/SimpleBorderText';
import LocalImageComponent from '../../../image-components/LocalImageComponent';
import TextGradientSvg from '../../../text-components/TextGradientSvg';
import WoodProgressBar from '../../../WoodProgressBar';
import Toast from '../../../custom-toast/Toast';

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');
const MINIMUM_NUMBER_OF_NEW_HIDDEN_WORD = 42;
const REWARD_PER_WORD = 1.42;
const REWARD_ANIMATION_MS = 2500;
const CONTENT_WIDTH = IS_TABLET_CONDITION ? 460 : SCREEN_WIDTH - 40;
const CONTENT_HEIGHT = SCREEN_HEIGHT * 0.6;

/** دکمه‌ی شمارنده‌ی کلمات پنهان و مودالی که کلمات پنهان را به سکه تبدیل می‌کند. */
function HiddenWords() {
  const dispatch = useDispatch<AppDispatch>();
  const colors = useAppTheme();
  const { hiddenFx } = useLettersStatic();
  // فقط shared valueها وارد worklet می‌شوند؛ `hiddenFx` خودش ref به view بومی دارد.
  const hiddenLanes = hiddenFx.lanes;
  const { newHiddenWords, totalHiddenWords } = useSelector((state: RootState) => state.hiddenWords);
  const localToastRef = useRef<any>(null);
  const convertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState(false);
  const reward = Math.round(newHiddenWords * REWARD_PER_WORD);
  const canConvert = newHiddenWords >= MINIMUM_NUMBER_OF_NEW_HIDDEN_WORD;

  const scale = useSharedValue(1);
  // روی JS (رندر اول) مقدار ثابت؛ بدون رفت‌وبرگشت همزمان به UI thread.
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: onUIThread() ? scale.value : 1 }] }));
  const rewardScale = useSharedValue(1);
  const rewardOpacity = useSharedValue(1);
  const rewardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: onUIThread() ? rewardScale.value : 1 }],
    opacity: onUIThread() ? rewardOpacity.value : 1,
  }));

  const bounceIcon = useCallback(() => {
    scale.value = 1;
    scale.value = withSequence(
      withTiming(0.7, { duration: 300, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 3, stiffness: 150, mass: 1.5 }),
    );
  }, [scale]);

  // وقتی کلمه‌ی پنهانِ در حال پرواز به دکمه می‌رسد، دکمه ضربه می‌خورد (به‌جای لحظه‌ی پیدا شدن کلمه).
  // کل افکت و زمان‌بندی‌اش روی UI thread است؛ نگاه کنید به `engine/hiddenWordFx.ts`.
  useAnimatedReaction(
    () => hiddenLanes.map(lane => lane.progress.value),
    (current, previous) => {
      if (previous === null) {
        return;
      }
      for (let i = 0; i < current.length; i++) {
        if (previous[i] < HIDDEN_FX_IMPACT && current[i] >= HIDDEN_FX_IMPACT) {
          scale.value = withSequence(
            withTiming(0.8, { duration: 70, easing: Easing.out(Easing.quad) }),
            withSpring(1, { damping: 5, stiffness: 260, mass: 1 }),
          );
          return;
        }
      }
    },
  );

  useEffect(
    () => () => {
      if (convertTimerRef.current) {
        clearTimeout(convertTimerRef.current);
      }
    },
    [],
  );

  const open = useCallback(() => {
    setVisible(true);
    bounceIcon();
  }, [bounceIcon]);

  const close = useCallback(() => {
    setVisible(false);
    rewardScale.value = 1;
    rewardOpacity.value = 1;
  }, [rewardScale, rewardOpacity]);

  const convert = () => {
    // تا تبدیل قبلی تمام نشده، لمس‌های بعدی نادیده گرفته می‌شوند؛ قبلاً هر لمس یک بار دیگر جایزه می‌داد.
    if (convertTimerRef.current) {
      return;
    }
    if (!canConvert) {
      localToastRef.current?.show({
        title: 'دریافت سکه',
        message: 'تعداد کلمات پنهان جدید، کمتر از حد نصاب برای تبدیل به سکه می‌باشد.',
        type: 'error',
        animationType: 'slide',
        position: 'top',
      });
      return;
    }
    rewardScale.value = 1;
    rewardOpacity.value = 1;
    rewardScale.value = withTiming(4, { duration: 1500, easing: Easing.out(Easing.quad) });
    rewardOpacity.value = withDelay(2000, withTiming(0, { duration: 500 }));
    const amount = reward;
    convertTimerRef.current = setTimeout(() => {
      convertTimerRef.current = null;
      dispatch(convertHiddenWordsToCoin());
      dispatch(increaseNumberCoins({ number: amount }));
    }, REWARD_ANIMATION_MS);
  };

  const labelStyle = [styles.buttonLabel, { color: colors.primary.a5 }];
  const titleStyle = [styles.statTitle, { color: colors.primary.a2 }];
  const valueStyle = [styles.statValue, { color: colors.primary.a4 }];

  return (
    <View ref={hiddenFx.buttonRef} collapsable={false} onLayout={() => hiddenFx.measure.current?.()}>
      <TouchableOpacity onPress={open} activeOpacity={0.6}>
        <AnimatedImageBackground
          source={require('../../../../assets/image/card_1.png')}
          style={[styles.button, iconStyle]}
          imageStyle={styles.stretch}
          resizeMode="stretch"
        >
          <Text style={labelStyle}>کلمات</Text>
          <Text style={labelStyle}>پنهان</Text>
        </AnimatedImageBackground>
      </TouchableOpacity>
      <Modal
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.5}
        isVisible={visible}
        onBackdropPress={close}
        onBackButtonPress={close}
        deviceHeight={SCREEN_HEIGHT}
        statusBarTranslucent
        coverScreen
        useNativeDriverForBackdrop
        style={I18nManager.isRTL ? styles.rtl : styles.ltr}
      >
        <Toast ref={localToastRef} defaultPosition="top" />
        <View style={styles.center}>
          <ImageBackground
            source={require('../../../../assets/image/paper_frame.png')}
            style={styles.paper}
            imageStyle={styles.stretch}
            resizeMode="stretch"
          >
            <View style={styles.paperContent}>
              <View style={styles.fullWidth}>
                <View style={styles.statRow}>
                  <Text style={titleStyle}>کل کلمات پنهان:</Text>
                  <Text style={valueStyle}>{priceDigitSeperator(totalHiddenWords)}</Text>
                </View>
                <Text style={styles.statHint}>
                  کل کلمات پنهانی که شما تاکنون در این حساب کاربری، در مراحل و چالش‌های مختلف، ایجاد کرده اید.
                </Text>
                <View style={[styles.statRow, styles.statRowSpaced]}>
                  <Text style={titleStyle}>کلمات پنهان جدید:</Text>
                  <Text style={valueStyle}>{priceDigitSeperator(newHiddenWords)}</Text>
                </View>
                <Text style={styles.statHint}>
                  تعداد کلمات پنهانی که اخیرا ایجاد کرده‌اید و می‌توانید آن‌ها را تبدیل به سکه کنید.
                </Text>
              </View>
              <View style={styles.actions}>
                <WoodProgressBar
                  progressWidth={CONTENT_WIDTH - 80}
                  progress={newHiddenWords}
                  maxValue={MINIMUM_NUMBER_OF_NEW_HIDDEN_WORD}
                  showValue
                />
                <Animated.View style={[styles.reward, rewardStyle]}>
                  <Image
                    style={[styles.coin, !canConvert && styles.dimmed]}
                    source={require('../../../../assets/image/coin.png')}
                  />
                  <Text style={[styles.statTitle, { color: canConvert ? colors.primary.a4 : `${colors.primary.a4}30` }]}>
                    {reward > 0 ? `${priceDigitSeperator(reward)}+` : ''}
                  </Text>
                </Animated.View>
                <TouchableOpacity activeOpacity={0.8} onPress={convert} style={styles.convertButton}>
                  <ImageBackground
                    source={require('../../../../assets/image/ads_btn_blu.png')}
                    style={[styles.convertButton, styles.convertButtonInner]}
                    imageStyle={styles.stretch}
                    resizeMode="stretch"
                  >
                    <TextGradientSvg
                      text="تبدیل به سکه"
                      fontFamily={Font.bakh_extra_bold}
                      fontSize={18}
                      colors={['#FFFFFF', '#fff5c8']}
                      shadowColor="#00000090"
                      shadowBlur={5}
                      dropShadow
                      borderColor="#000000"
                      borderWidth={1}
                      glowBlur={100}
                      glowColor="#fff5c8"
                      glowShadow
                    />
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
          <View style={styles.titleWrap}>
            <ImageBackground
              source={require('../../../../assets/image/header_title_frame.png')}
              style={styles.titleFrame}
              imageStyle={styles.stretch}
              resizeMode="stretch"
            >
              <SimpleBorderText
                text="کلمات پنهان"
                width={CONTENT_WIDTH - 100}
                height={22 * 1.6}
                fontSize={22}
                textColor={colors.primary.a5}
                borderColor="#4d2719"
              />
            </ImageBackground>
            <View style={styles.closeRow}>
              <TouchableOpacity activeOpacity={0.9} onPress={close} style={styles.closeButton}>
                <ImageBackground
                  source={require('../../../../assets/image/circle_button2.png')}
                  style={styles.closeFrame}
                  imageStyle={styles.stretch}
                  resizeMode="stretch"
                >
                  <LocalImageComponent
                    path={require('../../../../assets/image/close_in_wood.png')}
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
}

const styles = StyleSheet.create({
  rtl: { direction: 'rtl' },
  ltr: { direction: 'ltr' },
  stretch: { resizeMode: 'stretch' },
  button: { width: 40, height: 52, justifyContent: 'center', alignItems: 'center' },
  buttonLabel: { fontFamily: Font.bakh_semi_bold, fontSize: 9 },
  center: { alignItems: 'center', justifyContent: 'center' },
  paper: { width: CONTENT_WIDTH, height: CONTENT_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  paperContent: {
    width: CONTENT_WIDTH,
    height: CONTENT_HEIGHT,
    alignItems: 'center',
    padding: 40,
    justifyContent: 'space-between',
  },
  fullWidth: { width: '100%' },
  statRow: { width: '100%', alignItems: 'center', flexDirection: 'row', gap: 5 },
  statRowSpaced: { marginTop: 5 },
  statTitle: { fontFamily: Font.black, fontSize: 18 },
  statValue: { fontFamily: Font.black, fontSize: 22 },
  statHint: { fontFamily: Font.bakh_semi_bold, color: '#444444', fontSize: 9, textAlign: 'justify' },
  actions: { width: '100%', alignItems: 'center', gap: 10 },
  reward: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: 30, zIndex: 1000 },
  coin: { width: 25, height: 25 },
  dimmed: { opacity: 0.3 },
  convertButton: { width: 200, height: 55, alignItems: 'center', justifyContent: 'center' },
  convertButtonInner: { paddingBottom: 5 },
  titleWrap: { alignItems: 'center', alignSelf: 'center', position: 'absolute', top: -40 },
  titleFrame: {
    width: CONTENT_WIDTH - 100,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  closeRow: { width: CONTENT_WIDTH, alignItems: 'flex-start', position: 'absolute' },
  closeButton: { start: -10, top: 25 },
  closeFrame: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', paddingBottom: 5 },
});

export default memo(HiddenWords);
