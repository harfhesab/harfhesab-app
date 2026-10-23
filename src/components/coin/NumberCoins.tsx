import React, { memo, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ImageBackground, StyleSheet, TextInput, TouchableOpacity, View, type LayoutChangeEvent } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { useSelector, useStore } from 'react-redux';
import Animated, {
  Easing,
  cancelAnimation,
  runOnUI,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Font from '../../utils/Font';
import { coinCountUpdateSound } from '../../utils/sound/SoundFunctions';
import { priceDigitSeperator } from '../../utils/PriceDigitSeperator';
import { navigate } from '../../main/navigationService';
import type { RootState } from '../../redux/store/RootReducer';
import CoinEffects, { FRAME_HEIGHT, FX_DURATION, FX_GAIN, FX_HEIGHT, FX_IDLE, FX_SPEND, FX_WIDTH } from './CoinEffects';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// ─── زمان‌بندی ───────────────────────────────────────────────────────────────
/** شمارش عدد، و چرخش یکنواخت سکه در همین مدت. */
const COUNT_MS = 1000;
const SPIN_TURN_MS = 500;
/** بعد از شمارش، سکه چند دور دیگر می‌چرخد و کند می‌شود تا رو به کاربر بایستد. */
const SETTLE_MS = 2000;
const SETTLE_TURNS = 4;
const POP_SPRING = { damping: 5, stiffness: 280, mass: 0.8 };
const IDLE_POP_SPRING = { damping: 9, stiffness: 220, mass: 0.8 };
/** کمی تأخیر تا Canvas (که تازه mount شده) آماده‌ی کشیدن باشد. */
const FX_WARMUP_MS = 60;
/** چشمک بیکاری: اولین بار بعد از ورود به صفحه، و بعد هر چند ثانیه. */
const IDLE_FIRST_MS = 2000;
const IDLE_EVERY_MS = 6000;
/** جرینگ‌های پشت‌سرهمِ نزدیک به هم یکی می‌شوند؛ این فاصله بین همه‌ی شمارنده‌های برنامه مشترک است. */
const SOUND_MIN_GAP_MS = 150;

/** آخرین زمان پخش جرینگ، مشترک بین همه‌ی نمونه‌ها: وقتی دو شمارنده هم‌زمان دیده می‌شوند، صدا فقط یک بار پخش می‌شود. */
let lastCoinSoundAt = 0;

const readCoins = (state: RootState): number => {
  const value = state.coins.numberCoins;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};

function formatWithSeparator(n: number): string {
  'worklet';
  const s = String(Math.floor(Math.max(0, n)));
  let out = '';
  let count = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    out = s[i] + out;
    count++;
    if (count % 3 === 0 && i !== 0) {
      out = ',' + out;
    }
  }
  return out;
}

/**
 * فقط داخل worklet روی UI thread true است. اولین اجرای هر animated style روی JS است و خواندن `.value`
 * آنجا یک رفت‌وبرگشت همزمان به UI thread است که باز شدن صفحه را کند می‌کند؛ با این شرط مقدار اولیه‌ی
 * ثابت برگردانده می‌شود.
 */
const onUI = (): boolean => {
  'worklet';
  return _WORKLET === true;
};

/** `fn` را بعد از `first` میلی‌ثانیه و بعد هر `period` میلی‌ثانیه صدا می‌زند. تابع برگشتی آن را متوقف می‌کند. */
function startLoop(fn: () => void, first: number, period: number): () => void {
  let interval: ReturnType<typeof setInterval> | null = null;
  const timeout = setTimeout(() => {
    fn();
    interval = setInterval(fn, period);
  }, first);
  return () => {
    clearTimeout(timeout);
    if (interval !== null) {
      clearInterval(interval);
    }
  };
}

interface NumberCoinsProps {
  onPress?: () => void;
}

/**
 * شمارنده‌ی سکه‌ی هدر.
 *
 * تغییر سکه از `store.subscribe` تشخیص داده می‌شود، نه از رندر React: با `freezeOnBlur` صفحه‌ی فریز‌شده
 * رندر نمی‌شود و آپدیت‌ها در صف می‌مانند؛ اگر انیمیشن و صدا به رندر وصل باشند، با آنفریز شدن صفحه (مثلاً
 * `goBack`) دوباره اجرا می‌شوند. اشتراک store فریز نمی‌شود، پس:
 *  - نمونه‌ی دیده‌شونده (فریز نیست): عدد شمرده می‌شود، سکه می‌چرخد، افکت اجرا می‌شود.
 *  - نمونه‌ی فریز‌شده: عدد بی‌صدا و بدون انیمیشن همان لحظه درست می‌شود.
 *
 * «فریز بودن» با افکت‌های layout تشخیص داده می‌شود: React هنگام فریز (Suspense) آن‌ها را پاک می‌کند و
 * هنگام آنفریز دوباره اجرا می‌کند. معیار focus نیست، چون صفحه‌ای که زیر یک صفحه‌ی شفاف (مثلاً دیالوگ جایزه)
 * focus ندارد ولی هدرش دیده می‌شود. صدا هم بین نمونه‌ها مشترک است و هرگز دوبار پخش نمی‌شود.
 *
 * چرخش و شمارش همان انیمیشن قبلی‌اند (چرخش یکنواخت در حین شمارش، بعد چهار دور کندشونده)، با این فرق که
 * سکه همیشه رو به کاربر می‌ایستد. نور و جرقه با Skia کشیده می‌شود، ولی فقط وقتی لازم است mount می‌شود.
 */
function NumberCoins({ onPress = () => {} }: NumberCoinsProps) {
  // فقط برای اندازه‌ی فونت؛ انیمیشن و صدا به این وابسته نیستند.
  const numberCoins = useSelector(readCoins);
  const store = useStore<RootState>();
  const navigation = useContext(NavigationContext);
  const navigationRef = useRef(navigation);
  navigationRef.current = navigation;

  /** true یعنی صفحه فریز شده و دیده نمی‌شود. */
  const frozenRef = useRef(false);
  useLayoutEffect(() => {
    frozenRef.current = false;
    return () => {
      frozenRef.current = true;
    };
  }, []);

  /** آخرین مقداری که نمایش داده شده؛ نسخه‌ی JS تا هیچ‌وقت `.value` از JS خوانده نشود. */
  const shownRef = useRef(numberCoins);
  const initialTextRef = useRef(formatWithSeparator(numberCoins));
  const busyUntilRef = useRef(0);
  const fxSeedRef = useRef(0);
  const fxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [fxOn, setFxOn] = useState(false);

  const animatedValue = useSharedValue(numberCoins);
  // سکه با کمی بزرگی شروع می‌شود و بعد از ۱.۲ ثانیه کوچک می‌شود (همان ورود قبلی).
  const scale = useSharedValue(1.25);
  const rotateY = useSharedValue(0);
  const textScale = useSharedValue(1);
  const fxProgress = useSharedValue(1);
  const fxSeed = useSharedValue(0);
  const fxMode = useSharedValue(FX_GAIN);
  // مرکز آیکون سکه و عدد در مختصات قاب؛ با onLayout دقیق می‌شود (چیدمان راست‌به‌چپ هم درست حساب می‌شود).
  const coinX = useSharedValue(19.9);
  const coinY = useSharedValue(FRAME_HEIGHT / 2);

  const coinStyle = useAnimatedStyle(() => {
    if (!onUI()) {
      return { transform: [{ scale: 1.25 }, { rotateY: '0deg' }] };
    }
    return { transform: [{ scale: scale.value }, { rotateY: `${rotateY.value}deg` }] };
  });
  const textStyle = useAnimatedStyle(() => ({ transform: [{ scale: onUI() ? textScale.value : 1 }] }));
  const animatedTextProps = useAnimatedProps(() => {
    return { text: onUI() ? formatWithSeparator(animatedValue.value) : initialTextRef.current } as any;
  });

  const onCoinLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, y, width } = event.nativeEvent.layout;
      coinX.value = x + width / 2;
      coinY.value = y + 9;
    },
    [coinX, coinY],
  );

  const startFx = useCallback(
    (mode: number) => {
      const duration = FX_DURATION[mode];
      fxSeedRef.current += 1;
      fxMode.value = mode;
      fxSeed.value = fxSeedRef.current;
      fxProgress.value = 0;
      fxProgress.value = withDelay(FX_WARMUP_MS, withTiming(1, { duration, easing: Easing.linear }));
      setFxOn(true);
      if (fxTimerRef.current !== null) {
        clearTimeout(fxTimerRef.current);
      }
      fxTimerRef.current = setTimeout(() => {
        fxTimerRef.current = null;
        setFxOn(false);
      }, FX_WARMUP_MS + duration + 150);
    },
    [fxMode, fxProgress, fxSeed],
  );

  /** یک تغییر سکه‌ی دیده‌شده. */
  const playChange = useCallback(
    (target: number, diff: number) => {
      busyUntilRef.current = Date.now() + COUNT_MS + SETTLE_MS + 1800;

      const now = Date.now();
      if (now - lastCoinSoundAt >= SOUND_MIN_GAP_MS) {
        lastCoinSoundAt = now;
        coinCountUpdateSound();
      }
      startFx(diff > 0 ? FX_GAIN : FX_SPEND);

      runOnUI(() => {
        'worklet';
        // چرخش یکنواخت از زاویه‌ی فعلی؛ هر دور (۳۶۰ درجه) از همان نقطه دوباره شروع می‌شود، پس بدون پرش است.
        const start = rotateY.value % 360;
        rotateY.value = start;
        scale.value = 1;
        rotateY.value = withRepeat(withTiming(start + 360, { duration: SPIN_TURN_MS, easing: Easing.linear }), -1, false);

        animatedValue.value = withTiming(target, { duration: COUNT_MS, easing: Easing.out(Easing.quad) }, finished => {
          if (!finished) {
            return;
          }
          textScale.value = withSequence(
            withTiming(1.12, { duration: 100 }),
            withSpring(1, { damping: 7, stiffness: 240 }),
          );
          // چند دور دیگر با کند شدن تدریجی؛ زاویه‌ی پایانی مضرب ۳۶۰ است، پس سکه رو به کاربر می‌ایستد.
          const settle = Math.ceil((rotateY.value + 360 * SETTLE_TURNS) / 360) * 360;
          rotateY.value = withTiming(settle, { duration: SETTLE_MS, easing: Easing.out(Easing.quad) }, done => {
            if (!done) {
              return;
            }
            rotateY.value = 0;
            scale.value = withSequence(withSpring(1.25, POP_SPRING), withDelay(1200, withSpring(1, POP_SPRING)));
          });
        });
      })();
    },
    [animatedValue, rotateY, scale, startFx, textScale],
  );

  const handleCoins = useCallback(
    (next: number) => {
      const previous = shownRef.current;
      if (next === previous) {
        return;
      }
      shownRef.current = next;
      if (frozenRef.current) {
        // صفحه فریز است و دیده نمی‌شود: فقط عدد را بی‌صدا و بی‌انیمیشن درست می‌کنیم.
        animatedValue.value = next;
      } else {
        playChange(next, next - previous);
      }
    },
    [animatedValue, playChange],
  );

  useEffect(() => {
    // اگر بین اولین رندر و اتصال اشتراک چیزی عوض شده باشد، همین‌جا جبران می‌شود.
    handleCoins(readCoins(store.getState()));
    return store.subscribe(() => handleCoins(readCoins(store.getState())));
  }, [store, handleCoins]);

  // ورود: سکه‌ی بزرگ‌شده بعد از ۱.۲ ثانیه به اندازه‌ی عادی برمی‌گردد.
  useEffect(() => {
    scale.value = withDelay(1200, withSpring(1, POP_SPRING));
  }, [scale]);

  /** چشمک بیکاری: جهش سکه + برق روی سکه، نور گذرنده از قاب و ستاره‌ها. وسط شمارش و چرخش نادیده گرفته می‌شود. */
  const idleMoment = useCallback(() => {
    if (Date.now() < busyUntilRef.current) {
      return;
    }
    busyUntilRef.current = Date.now() + FX_DURATION[FX_IDLE];
    // جهش کوچک و نرم همراه با برق (کمتر از جهش بعد از چرخش).
    scale.value = withSequence(withSpring(1.12, IDLE_POP_SPRING), withDelay(450, withSpring(1, IDLE_POP_SPRING)));
    startFx(FX_IDLE);
  }, [scale, startFx]);

  useEffect(() => {
    let stop: (() => void) | null = null;
    const start = () => {
      stop?.();
      stop = startLoop(idleMoment, IDLE_FIRST_MS, IDLE_EVERY_MS);
    };
    const halt = () => {
      stop?.();
      stop = null;
    };

    if (!navigation) {
      start();
      return halt;
    }
    if (navigation.isFocused()) {
      start();
    }
    const unsubscribeFocus = navigation.addListener('focus', start);
    const unsubscribeBlur = navigation.addListener('blur', halt);
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      halt();
    };
  }, [navigation, idleMoment]);

  useEffect(
    () => () => {
      if (fxTimerRef.current !== null) {
        clearTimeout(fxTimerRef.current);
      }
      [animatedValue, scale, rotateY, textScale, fxProgress].forEach(value => cancelAnimation(value));
    },
    [animatedValue, scale, rotateY, textScale, fxProgress],
  );

  const onClick = () => {
    onPress?.();
    navigate('CoinPlans');
  };

  const coinStr = String(numberCoins);
  const fontSize = coinStr.length > 5 ? 13 : coinStr.length > 4 ? 14 : 16;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onClick}
      accessibilityRole="button"
      accessibilityLabel={`سکه‌ها: ${priceDigitSeperator(coinStr)}`}
    >
      <ImageBackground
        source={require('../../assets/image/frame_coin.png')}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
        resizeMode="stretch"
      >
        <View style={styles.container}>
          <Animated.View style={[styles.textWrapper, textStyle]}>
            <AnimatedTextInput
              editable={false}
              underlineColorAndroid="transparent"
              animatedProps={animatedTextProps}
              defaultValue={priceDigitSeperator(coinStr)}
              style={[styles.textInput, { fontSize }]}
            />
          </Animated.View>

          <View style={styles.coinWrapper} onLayout={onCoinLayout}>
            <Animated.Image style={[styles.coinImage, coinStyle]} source={require('../../assets/image/coin.png')} />
          </View>
        </View>
        {fxOn && (
          <View style={styles.fx} pointerEvents="none">
            <CoinEffects
              progress={fxProgress}
              seed={fxSeed}
              mode={fxMode}
              coinX={coinX}
              coinY={coinY}
            />
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: 115,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyle: {
    resizeMode: 'stretch',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingEnd: 9,
    paddingStart: 25,
  },
  textWrapper: {
    width: 50,
    alignItems: 'center',
  },
  textInput: {
    fontFamily: Font.bakh_bold,
    color: '#FFFFFF',
    padding: 0,
    textAlign: 'center',
  },
  coinWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 2,
  },
  coinImage: {
    width: 20,
    height: 20,
  },
  // بوم افکت‌ها دور قاب وسط‌چین می‌شود (بدون left/right، چون در چیدمان راست‌به‌چپ جابه‌جا می‌شوند)
  // و حاشیه‌هایش متقارن است؛ پس مرکزش دقیقاً روی مرکز قاب می‌افتد.
  fx: {
    position: 'absolute',
    width: FX_WIDTH,
    height: FX_HEIGHT,
  },
});

export default memo(NumberCoins);