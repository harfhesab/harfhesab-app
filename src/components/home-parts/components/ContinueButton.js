import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
    Canvas,
    Circle,
    Group,
    LinearGradient,
    Path,
    RadialGradient,
    Rect,
    RoundedRect,
    Shadow,
    Skia,
    rect,
    rrect,
    vec,
} from '@shopify/react-native-skia';
import Animated, {
    Easing,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import {useDispatch, useSelector, shallowEqual} from 'react-redux';
import {BLEED, CONT_H, CONT_LIP, CONT_R, GOLD, IS_RTL} from '../homeConfig';
import Font from '../../../utils/Font';
import Icon from '../../../utils/Icon';
import {reset} from '../../../main/navigationService';
import {changeStageGameLanguage} from '../../../redux/slices/stageGamePersistSlice';
import {deleteContinueGame} from '../../../redux/slices/settingSlice';

const FACE_H = CONT_H - CONT_LIP;
const SHIMMER_W = 70;

// ابعاد
const SIDE_PAD = 14;
const DISC_R = 23;
const DISC_D = DISC_R * 2;
const GLOW_HALF = 46; // نیمه‌ی اندازه‌ی کانواس درخشش
const CLOSE_D = 26;
const SPINNER_R = 14;

const ICON_COLOR = '#FFD23F';
const SAFETY_RESET_MS = 6000;
const NAV_DELAY_MS = 120; // فرصت برای نمایش لودینگ قبل از کار سنگین reset

const makeFaceClip = (width) => rrect(rect(0, 0, width, FACE_H), CONT_R, CONT_R);

// کمان اسپینر (یک‌بار ساخته می‌شود)
const SPINNER_ARC = (() => {
    const p = Skia.Path.Make();
    p.addArc(
        {x: GLOW_HALF - SPINNER_R, y: GLOW_HALF - SPINNER_R, width: SPINNER_R * 2, height: SPINNER_R * 2},
        0,
        120,
    );
    return p;
})();

// ستاره‌ی چهارپر برق‌دار (مرکز در 0,0)
const STAR_PATH = 'M0 -1 Q0 0 1 0 Q0 0 0 1 Q0 0 -1 0 Q0 0 0 -1 Z';

// جای جرقه‌ها نسبت به مرکز دیسک: [x, y, اندازه, فاز]
const SPARKLES = [
    [-20, -22, 5.5, 0],
    [24, -12, 4, 2.1],
    [18, 24, 4.5, 4.2],
];

const selectContinue = (state) => {
    const s = state.setting;
    return {
        continueGameType: s.continueGameType,
        continueGameLanguageId: s.continueGameLanguageId,
        continueGameLanguageName: s.continueGameLanguageName,
        continueGameSeasonId: s.continueGameSeasonId,
        continueGameSeasonName: s.continueGameSeasonName,
        continueGameId: s.continueGameId,
        continueGameName: s.continueGameName,
        continueGamePackageId: s.continueGamePackageId,
        continueGamePackageName: s.continueGamePackageName,
        continueGamePackageIcon: s.continueGamePackageIcon,
        continueGameUserPackage: s.continueGameUserPackage,
        continueGameLastStage: s.continueGameLastStage,
    };
};

/* بدنه‌ی ایستا: فقط با تغییر width یا موقعیت دیسک دوباره رسم می‌شود (نه با loading) */
const ButtonBody = memo(function ButtonBody({width, cx, cy}) {
    const faceClip = useMemo(() => makeFaceClip(width), [width]);

    return (
        <Canvas
            pointerEvents="none"
            style={{
                position: 'absolute',
                left: -BLEED,
                top: -BLEED,
                width: width + BLEED * 2,
                height: CONT_H + BLEED * 2,
            }}>
            <Group transform={[{translateX: BLEED}, {translateY: BLEED}]}>
                <RoundedRect x={0} y={CONT_LIP} width={width} height={FACE_H} r={CONT_R} color="#9A6B12" />
                <RoundedRect x={0} y={0} width={width} height={FACE_H} r={CONT_R}>
                    <LinearGradient start={vec(0, 0)} end={vec(width, FACE_H)} colors={GOLD} />
                    <Shadow dx={0} dy={4} blur={5} color="rgba(240,185,59,0.3)" />
                </RoundedRect>
                <Group clip={faceClip}>
                    <Rect x={0} y={0} width={width} height={FACE_H * 0.5}>
                        <LinearGradient
                            start={vec(0, 0)}
                            end={vec(0, FACE_H * 0.5)}
                            colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
                        />
                    </Rect>
                </Group>

                {/* دیسک تیره با گرادیان شعاعی + حلقه‌ی طلایی */}
                <Circle cx={cx} cy={cy} r={DISC_R}>
                    <RadialGradient c={vec(cx, cy)} r={DISC_R} colors={['#3A2403', '#1A0F00']} />
                </Circle>
                <Circle cx={cx} cy={cy} r={DISC_R - 0.75} style="stroke" strokeWidth={1.5}>
                    <LinearGradient
                        start={vec(cx - DISC_R, cy - DISC_R)}
                        end={vec(cx + DISC_R, cy + DISC_R)}
                        colors={['#FFE9A0', '#B8801A', '#FFE9A0']}
                    />
                </Circle>
            </Group>
        </Canvas>
    );
});

/* جاروی نور */
const ShimmerSweep = memo(function ShimmerSweep({width, time}) {
    const clip = useMemo(() => makeFaceClip(width), [width]);
    const idle = useMemo(() => [{translateX: width + 80}, {skewX: -0.35}], [width]);
    const transform = useDerivedValue(() => {
        const p = Math.min((time.value % 4200) / 1400, 1);
        if (p >= 1) {
            return idle;
        }
        return [{translateX: -80 + p * (width + 160)}, {skewX: -0.35}];
    }, [width, idle]);

    return (
        <Canvas pointerEvents="none" style={{position: 'absolute', left: 0, top: 0, width, height: FACE_H}}>
            <Group clip={clip}>
                <Group transform={transform}>
                    <Rect x={0} y={0} width={SHIMMER_W} height={FACE_H}>
                        <LinearGradient
                            start={vec(0, 0)}
                            end={vec(SHIMMER_W, 0)}
                            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                        />
                    </Rect>
                </Group>
            </Group>
        </Canvas>
    );
});

/* یک جرقه‌ی چشمک‌زن */
const Sparkle = memo(function Sparkle({x, y, size, phase, time}) {
    const t = useDerivedValue(() => Math.max(0, Math.sin(time.value / 380 + phase)));
    const transform = useDerivedValue(() => [{translateX: x}, {translateY: y}, {scale: size * (0.3 + t.value * 0.9)}]);
    const opacity = useDerivedValue(() => t.value);
    return (
        <Group transform={transform} opacity={opacity}>
            <Path path={STAR_PATH} color="#FFFFFF" />
        </Group>
    );
});

/**
 * آیکون دسته‌ی بازی.
 * - آیکون فقط یک لایه‌ی تیز و ثابت است (بدون textShadow و بدون scale).
 * - درخشش کاملاً در Skia و «پشت» آیکون رسم می‌شود؛ مرکز گرادیان‌ها شفاف است،
 *   پس نور فقط دور آیکون می‌تپد و هرگز روی آن نمی‌افتد.
 * - progress (۰ تا ۱): انتقال از آیکون به اسپینر، روی UI thread.
 */
const GlowingController = memo(function GlowingController({time, progress}) {
    const pulse = useDerivedValue(() => 0.5 + 0.5 * Math.sin(time.value / 450));

    // حلقه‌ی بیرون دیسک (scale همیشه ≥ ۱ تا لبه‌ی داخلی حلقه داخل دیسک نیفتد)
    const ringTransform = useDerivedValue(() => [{scale: 1 + pulse.value * 0.08}]);
    const ringOpacity = useDerivedValue(() => 0.55 + pulse.value * 0.45);

    // بلوم داخل دیسک، دور آیکون (وسطش شفاف است)
    const bloomOpacity = useDerivedValue(() => (0.25 + pulse.value * 0.75) * (1 - progress.value));

    const sparkleOpacity = useDerivedValue(() => 1 - progress.value);
    const spinOpacity = useDerivedValue(() => progress.value);
    const spinTransform = useDerivedValue(() => [{rotate: ((time.value % 800) / 800) * Math.PI * 2}]);

    const iconStyle = useAnimatedStyle(() => ({opacity: 1 - progress.value}));

    const c = vec(GLOW_HALF, GLOW_HALF);

    return (
        <>
            <Canvas
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    start: SIDE_PAD + DISC_R - GLOW_HALF,
                    top: FACE_H / 2 - GLOW_HALF,
                    width: GLOW_HALF * 2,
                    height: GLOW_HALF * 2,
                }}>
                {/* حلقه‌ی نورانی بیرون دیسک */}
                <Group origin={c} transform={ringTransform} opacity={ringOpacity}>
                    <Circle c={c} r={GLOW_HALF}>
                        <RadialGradient
                            c={c}
                            r={GLOW_HALF}
                            colors={[
                                'rgba(255,236,150,0)',
                                'rgba(255,236,150,0)',
                                'rgba(255,236,150,0.9)',
                                'rgba(255,200,60,0)',
                            ]}
                            positions={[0, 0.55, 0.62, 1]}
                        />
                    </Circle>
                </Group>

                {/* بلوم داخل دیسک: دور آیکون می‌تپد، مرکزش شفاف است */}
                <Group opacity={bloomOpacity}>
                    <Circle c={c} r={DISC_R - 1.5}>
                        <RadialGradient
                            c={c}
                            r={DISC_R - 1.5}
                            colors={['rgba(255,176,32,0)', 'rgba(255,176,32,0.5)', 'rgba(255,176,32,0)']}
                            positions={[0.5, 0.78, 1]}
                        />
                    </Circle>
                </Group>

                {/* جرقه‌ها */}
                <Group opacity={sparkleOpacity}>
                    <Group transform={[{translateX: GLOW_HALF}, {translateY: GLOW_HALF}]}>
                        {SPARKLES.map(([x, y, size, phase], i) => (
                            <Sparkle key={i} x={x} y={y} size={size} phase={phase} time={time} />
                        ))}
                    </Group>
                </Group>

                {/* اسپینر لودینگ: مسیر کم‌رنگ + کمان طلایی چرخان */}
                <Group opacity={spinOpacity}>
                    <Circle c={c} r={SPINNER_R} style="stroke" strokeWidth={3} color="rgba(255,210,63,0.22)" />
                    <Group origin={c} transform={spinTransform}>
                        <Path
                            path={SPINNER_ARC}
                            style="stroke"
                            strokeWidth={3.5}
                            strokeCap="round"
                            color={ICON_COLOR}
                        />
                    </Group>
                </Group>
            </Canvas>

            {/* آیکون: بالاترین لایه، همیشه تیز و بدون هیچ سایه‌ی متنی */}
            <View pointerEvents="none" style={styles.iconBox}>
                <Animated.View style={[styles.iconLayer, iconStyle]}>
                    <Icon name={'game-controller'} type={'Ionicons'} style={{fontSize: 25, color: ICON_COLOR}} />
                </Animated.View>
            </View>
        </>
    );
});

const buildRoutes = (s) => {
    switch (s.continueGameType) {
        case 'stage-game':
            return [
                {name: 'Home'},
                {name: 'StageGame'},
                {
                    name: 'StagesStageGameSeason',
                    params: {season: s.continueGameSeasonId, seasonName: s.continueGameSeasonName},
                },
                {name: 'WordToSlotStageGame', params: {stage: s.continueGameId}},
            ];
        case 'package-game':
            return [
                {name: 'Home'},
                {
                    name: 'StartPackageGame',
                    params: {_id: s.continueGameUserPackage, packageId: s.continueGamePackageId},
                },
                {
                    name: 'StagesPackageGameSeason',
                    params: {
                        season: s.continueGameSeasonId,
                        userPackageId: s.continueGameUserPackage,
                        seasonName: s.continueGameSeasonName,
                        packageName: s.continueGamePackageName,
                        packageIcon: s.continueGamePackageIcon,
                    },
                },
                {
                    name: 'WordToSlotPackageGame',
                    params: {
                        stage: s.continueGameId,
                        lastStage: s.continueGameLastStage,
                        packageRef: s.continueGamePackageId,
                        userPackage: s.continueGameUserPackage,
                        packageName: s.continueGamePackageName,
                    },
                },
            ];
        case 'harf-akhar':
            return [
                {name: 'Home'},
                {name: 'HarfAkharBottomTab'},
                {name: 'HarfAkharInformation', params: {_id: s.continueGameId}},
            ];
        default:
            return null;
    }
};

const buildTexts = (s) => {
    const {continueGameType: type} = s;
    const title =
        type === 'stage-game'
            ? `ادامهٔ بازی مرحله‌ای - زبان ${s.continueGameLanguageName}`
            : type === 'package-game'
            ? `ادامهٔ بازی داستانی - ${s.continueGamePackageName}`
            : type === 'harf-akhar'
            ? 'ادامهٔ بازی حرف آخر'
            : '';
    const subtitle =
        type === 'stage-game' || type === 'package-game'
            ? `فصل ${s.continueGameSeasonName}، مرحله ${s.continueGameName}`
            : `چالش ${s.continueGameName}`;
    return {title, subtitle};
};

/**
 * دکمه‌ی «ادامه بازی».
 */
const ContinueButton = memo(function ContinueButton({width, time}) {
    const dispatch = useDispatch();
    const s = useSelector(selectContinue, shallowEqual);

    const [loading, setLoading] = useState(false);
    const progress = useSharedValue(0); // ۰ = عادی، ۱ = لودینگ
    const busyRef = useRef(false);
    const navTimer = useRef(null);
    const safetyTimer = useRef(null);

    const clearTimers = useCallback(() => {
        clearTimeout(navTimer.current);
        clearTimeout(safetyTimer.current);
    }, []);

    // پاک‌سازی تایمرها هنگام unmount
    useEffect(() => clearTimers, [clearTimers]);

    const handlePress = useCallback(() => {
        if (busyRef.current) {
            return;
        }
        const routes = buildRoutes(s);
        if (!routes) {
            return;
        }

        busyRef.current = true;
        // انتقال آیکون به اسپینر روی UI thread
        progress.value = withTiming(1, {duration: 160, easing: Easing.out(Easing.quad)});
        setLoading(true);

        // اگر ناوبری انجام نشد، دکمه به حالت عادی برمی‌گردد
        safetyTimer.current = setTimeout(() => {
            busyRef.current = false;
            progress.value = withTiming(0, {duration: 200});
            setLoading(false);
        }, SAFETY_RESET_MS);

        // کمی تاخیر تا اسپینر نمایان شود، بعد کار سنگین
        navTimer.current = setTimeout(() => {
            if (s.continueGameType === 'stage-game') {
                dispatch(
                    changeStageGameLanguage({
                        language: s.continueGameLanguageId,
                        languageName: s.continueGameLanguageName,
                    }),
                );
            }
            reset(routes);
        }, NAV_DELAY_MS);
    }, [s, dispatch, progress]);

    const handleClose = useCallback(() => {
        dispatch(deleteContinueGame());
    }, [dispatch]);

    const {title, subtitle} = useMemo(() => buildTexts(s), [s]);

    if (!s.continueGameType || !s.continueGameId) {
        return null;
    }

    // مرکز دیسک در مختصات Skia (آینه نمی‌شود): در RTL سمت راست، در LTR سمت چپ
    const cx = IS_RTL ? width - SIDE_PAD - DISC_R : SIDE_PAD + DISC_R;
    const cy = FACE_H / 2;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${loading ? 'در حال انتقال' : title} ${subtitle}`}
            accessibilityState={{busy: loading, disabled: loading}}
            disabled={loading}
            onPress={handlePress}
            style={({pressed}) => [{width, height: CONT_H}, pressed && styles.pressed]}>
            <ButtonBody width={width} cx={cx} cy={cy} />

            <ShimmerSweep width={width} time={time} />

            <GlowingController time={time} progress={progress} />

            <View style={styles.texts} pointerEvents="none">
                <Text numberOfLines={1} style={[styles.small, {fontFamily: Font.bakh_extra_bold}]}>
                    {loading ? 'در حال انتقال...' : title}
                </Text>
                <Text numberOfLines={1} style={[styles.big, {fontFamily: Font.bakh_extra_bold}]}>
                    {subtitle}
                </Text>
            </View>

            {/* دکمه‌ی بستن: در حالت لودینگ مخفی می‌شود */}
            {!loading && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="بستن"
                    onPress={handleClose}
                    hitSlop={10}
                    style={({pressed}) => [styles.close, pressed && styles.closePressed]}>
                    <Icon name={'close'} type={'Ionicons'} style={styles.closeIcon} />
                </Pressable>
            )}
        </Pressable>
    );
});

const styles = StyleSheet.create({
    pressed: {opacity: 0.9, transform: [{scale: 0.97}]},
    iconBox: {
        position: 'absolute',
        start: SIDE_PAD,
        top: (FACE_H - DISC_D) / 2,
        width: DISC_D,
        height: DISC_D,
    },
    iconLayer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    texts: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: FACE_H,
        justifyContent: 'center',
        paddingStart: SIDE_PAD + DISC_D + 12,
        paddingEnd: SIDE_PAD + CLOSE_D + 10,
    },
    small: {color: '#960000', opacity: 0.75, fontSize: 12},
    big: {color: '#2A1A00', fontSize: 14},
    close: {
        position: 'absolute',
        end: SIDE_PAD,
        top: (FACE_H - CLOSE_D) / 2,
        width: CLOSE_D,
        height: CLOSE_D,
        borderRadius: CLOSE_D / 2,
        backgroundColor: 'rgba(42,26,0,0.16)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closePressed: {backgroundColor: 'rgba(42,26,0,0.3)'},
    closeIcon: {fontSize: 17, color: '#2A1A00'},
});

export default ContinueButton;