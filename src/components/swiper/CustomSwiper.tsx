import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    AppState,
    I18nManager,
    LayoutChangeEvent,
    Pressable,
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    cancelAnimation,
    Extrapolation,
    interpolate,
    interpolateColor,
    runOnJS,
    SharedValue,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    WithSpringConfig,
} from 'react-native-reanimated';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface CustomSwiperRef {
    goTo: (index: number, animated?: boolean) => void;
    next: () => void;
    prev: () => void;
}

export interface CustomSwiperProps<T> {
    data: T[];
    renderItem: (info: { item: T; index: number; isActive: boolean }) => React.ReactElement | null;
    keyExtractor?: (item: T, index: number) => string;

    /** If provided, the first frame is already correct (no layout pass needed). */
    width?: number;
    height?: number;

    /** 0-based. The page is placed instantly on mount, with no animation. */
    initialIndex?: number;

    autoPlay?: boolean;
    autoPlayInterval?: number; // ms
    autoPlayLoop?: boolean; // go back to the first page after the last one

    /** Defaults to I18nManager.isRTL. Pass explicitly to override. */
    rtl?: boolean;
    scrollEnabled?: boolean;

    /** How many pages on each side of the active one stay mounted. */
    renderWindow?: number;

    showDots?: boolean;
    dotsPressable?: boolean;
    dotColor?: string;
    activeDotColor?: string;
    dotSize?: number;
    activeDotWidth?: number;
    dotSpacing?: number;
    paginationStyle?: StyleProp<ViewStyle>;

    onIndexChange?: (index: number) => void;
    style?: StyleProp<ViewStyle>;
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const SPRING: WithSpringConfig = {
    damping: 26,
    stiffness: 200,
    mass: 1,
    overshootClamping: true,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
};

const EDGE_RESISTANCE = 0.35;
const FLING_PROJECTION = 0.15; // seconds of velocity projected forward

function clamp(v: number, min: number, max: number) {
    'worklet';
    return Math.min(Math.max(v, min), max);
}

/** Rubber-band effect when dragging beyond the first / last page. */
function rubberBand(v: number, max: number) {
    'worklet';
    if (v < 0) return v * EDGE_RESISTANCE;
    if (v > max) return max + (v - max) * EDGE_RESISTANCE;
    return v;
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

interface PageProps {
    index: number;
    progress: SharedValue<number>;
    pageWidth: number;
    dir: 1 | -1;
    isActive: boolean;
    children: React.ReactNode;
}

function SwiperPage({ index, progress, pageWidth, dir, isActive, children }: PageProps) {
    const animatedStyle = useAnimatedStyle(() => {
        const offset = index - progress.value;
        const abs = Math.abs(offset);
        return {
            opacity: interpolate(abs, [0, 1, 1.5], [1, 0.55, 0], Extrapolation.CLAMP),
            transform: [
                { translateX: dir * offset * pageWidth },
                { scale: interpolate(abs, [0, 1], [1, 0.9], Extrapolation.CLAMP) },
            ],
        };
    }, [pageWidth, dir]);

    return (
        <Animated.View
            pointerEvents={isActive ? 'auto' : 'none'}
            style={[StyleSheet.absoluteFill, animatedStyle]}
        >
            {children}
        </Animated.View>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    Dot                                     */
/* -------------------------------------------------------------------------- */

interface DotProps {
    index: number;
    progress: SharedValue<number>;
    size: number;
    activeWidth: number;
    spacing: number;
    color: string;
    activeColor: string;
    onPress?: (index: number) => void;
}

function Dot({ index, progress, size, activeWidth, spacing, color, activeColor, onPress }: DotProps) {
    const animatedStyle = useAnimatedStyle(() => {
        // t = 1 when this dot is the current page, 0 when 1+ pages away
        const t = interpolate(Math.abs(progress.value - index), [0, 1], [1, 0], Extrapolation.CLAMP);
        return {
            width: size + (activeWidth - size) * t,
            opacity: 0.55 + 0.45 * t,
            backgroundColor: interpolateColor(t, [0, 1], [color, activeColor]),
        };
    }, [size, activeWidth, color, activeColor]);

    return (
        <Pressable
            disabled={!onPress}
            onPress={() => onPress?.(index)}
            hitSlop={8}
            style={{ marginHorizontal: spacing / 2 }}
        >
            <Animated.View style={[{ height: size, borderRadius: size / 2 }, animatedStyle]} />
        </Pressable>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   Swiper                                   */
/* -------------------------------------------------------------------------- */

function CustomSwiperInner<T>(props: CustomSwiperProps<T>, ref: React.Ref<CustomSwiperRef>) {
    const {
        data,
        renderItem,
        keyExtractor,
        width: widthProp,
        height: heightProp,
        initialIndex = 0,
        autoPlay = false,
        autoPlayInterval = 4000,
        autoPlayLoop = true,
        rtl,
        scrollEnabled = true,
        renderWindow = 2,
        showDots = true,
        dotsPressable = false,
        dotColor = '#ffffff95',
        activeDotColor = '#ffffff',
        dotSize = 7,
        activeDotWidth = 18,
        dotSpacing = 6,
        paginationStyle,
        onIndexChange,
        style,
    } = props;

    const count = data.length;
    const isRTL = rtl ?? I18nManager.isRTL;
    const dir: 1 | -1 = isRTL ? -1 : 1;

    const safeInitial = clamp(initialIndex, 0, Math.max(count - 1, 0));

    const [measuredWidth, setMeasuredWidth] = useState(0);
    const pageWidth = widthProp ?? measuredWidth;

    // The initial value is applied at creation => first frame is already on the right page.
    const progress = useSharedValue(safeInitial);
    const startProgress = useSharedValue(safeInitial);

    const [activeIndex, setActiveIndex] = useState(safeInitial);
    const activeIndexRef = useRef(safeInitial);
    const pausedRef = useRef(false);
    const onIndexChangeRef = useRef(onIndexChange);
    onIndexChangeRef.current = onIndexChange;

    const setPaused = useCallback((v: boolean) => {
        pausedRef.current = v;
    }, []);

    const handleIndexChange = useCallback((i: number) => {
        activeIndexRef.current = i;
        setActiveIndex(i);
        onIndexChangeRef.current?.(i);
    }, []);

    const rewindAnimated = count <= renderWindow * 2 + 1;

    const goTo = useCallback(
        (index: number, animated = true) => {
            if (count === 0) return;
            const target = clamp(index, 0, count - 1);
            cancelAnimation(progress);
            if (animated) {
                progress.value = withSpring(target, SPRING);
            } else {
                progress.value = target;
            }
        },
        [count, progress],
    );

    useImperativeHandle(
        ref,
        () => ({
            goTo,
            next: () => goTo(activeIndexRef.current + 1),
            prev: () => goTo(activeIndexRef.current - 1),
        }),
        [goTo],
    );

    // Track the rounded page index (runs on the UI thread, notifies JS only on change).
    useAnimatedReaction(
        () => clamp(Math.round(progress.value), 0, Math.max(count - 1, 0)),
        (current, previous) => {
            if (previous !== null && current !== previous) {
                runOnJS(handleIndexChange)(current);
            }
        },
        [count],
    );

    // Data length changed and the active page no longer exists.
    useEffect(() => {
        if (count > 0 && activeIndex > count - 1) goTo(count - 1, false);
    }, [count, activeIndex, goTo]);

    /* ------------------------------- Gesture -------------------------------- */

    const pan = useMemo(
        () =>
            Gesture.Pan()
                .enabled(scrollEnabled && count > 1 && pageWidth > 0)
                .activeOffsetX([-10, 10])
                .failOffsetY([-24, 24])
                .onBegin(() => {
                    runOnJS(setPaused)(true);
                })
                .onStart(() => {
                    cancelAnimation(progress);
                    startProgress.value = progress.value;
                })
                .onUpdate((e) => {
                    const raw = startProgress.value - (dir * e.translationX) / pageWidth;
                    progress.value = rubberBand(raw, count - 1);
                })
                .onEnd((e) => {
                    const velocity = (-dir * e.velocityX) / pageWidth; // pages / second
                    const base = Math.round(startProgress.value);
                    // At most one page per swipe, direction decided by distance + fling
                    const target = clamp(
                        Math.round(progress.value + velocity * FLING_PROJECTION),
                        Math.max(base - 1, 0),
                        Math.min(base + 1, count - 1),
                    );
                    progress.value = withSpring(target, { ...SPRING, velocity });
                })
                .onFinalize(() => {
                    runOnJS(setPaused)(false);
                }),
        [scrollEnabled, count, pageWidth, dir, progress, startProgress, setPaused],
    );

    /* ------------------------------- Autoplay ------------------------------- */

    useEffect(() => {
        if (!autoPlay || count < 2 || pageWidth === 0) return;

        let timer: ReturnType<typeof setTimeout>;
        const schedule = (delay: number) => {
            timer = setTimeout(() => {
                if (pausedRef.current || AppState.currentState !== 'active') {
                    schedule(Math.min(autoPlayInterval, 800));
                    return;
                }
                const next = activeIndex + 1;
                if (next <= count - 1) goTo(next);
                else if (autoPlayLoop) goTo(0, rewindAnimated);
            }, delay);
        };
        schedule(autoPlayInterval);

        // Re-runs whenever the page changes, so a manual swipe resets the timer.
        return () => clearTimeout(timer);
    }, [autoPlay, autoPlayInterval, autoPlayLoop, activeIndex, count, pageWidth, goTo, rewindAnimated]);

    /* -------------------------------- Render -------------------------------- */

    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            if (widthProp === undefined) setMeasuredWidth(e.nativeEvent.layout.width);
        },
        [widthProp],
    );

    const containerStyle: StyleProp<ViewStyle> = [
        // Forces physical left→right layout so that the math below is the same in RTL and LTR.
        { width: widthProp, height: heightProp, overflow: 'hidden', direction: 'ltr' },
        style,
    ];

    return (
        // Own root view: makes the swiper work even if the app root / a Modal has no GestureHandlerRootView.
        <GestureHandlerRootView style={containerStyle} onLayout={onLayout}>
            <GestureDetector gesture={pan}>
                <Animated.View style={styles.fill}>
                    {pageWidth > 0 &&
                        data.map((item, index) => {
                            if (Math.abs(index - activeIndex) > renderWindow) return null;
                            const isActive = index === activeIndex;
                            return (
                                <SwiperPage
                                    key={keyExtractor ? keyExtractor(item, index) : String(index)}
                                    index={index}
                                    progress={progress}
                                    pageWidth={pageWidth}
                                    dir={dir}
                                    isActive={isActive}
                                >
                                    {renderItem({ item, index, isActive })}
                                </SwiperPage>
                            );
                        })}

                    {showDots && count > 1 && (
                        <View pointerEvents="box-none" style={[styles.pagination, paginationStyle]}>
                            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', backgroundColor:"#00000085", padding:5, borderRadius:10 }}>
                                {data.map((_, index) => (
                                    <Dot
                                        key={index}
                                        index={index}
                                        progress={progress}
                                        size={dotSize}
                                        activeWidth={activeDotWidth}
                                        spacing={dotSpacing}
                                        color={dotColor}
                                        activeColor={activeDotColor}
                                        onPress={dotsPressable ? (i) => goTo(i) : undefined}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

export const CustomSwiper = forwardRef(CustomSwiperInner) as <T>(
    props: CustomSwiperProps<T> & React.RefAttributes<CustomSwiperRef>,
) => React.ReactElement | null;

export default CustomSwiper;

const styles = StyleSheet.create({
    fill: { flex: 1 },
    pagination: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
});