import React, { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    Blur,
    Canvas,
    Circle,
    FractalNoise,
    Group,
    Image,
    LinearGradient,
    Path,
    Rect,
    RoundedRect,
    Shadow,
    rect,
    rrect,
    useImage,
    vec,
} from '@shopify/react-native-skia';
import {
    cancelAnimation,
    Easing,
    useDerivedValue,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type GlassColors = [string, string, string];

interface Props {
    width: number;
    height: number;
    radius?: number;
    /** Full URL of the image under the glass. It is drawn blurred by Skia (real frosted look). */
    imageUri?: string | null;
    /** Glass tint (top-left → middle → bottom-right). */
    colors?: GlassColors;
    /**
     * 0..1 — how "matte" the glass is. It drives the tint, the milky veil AND the blur together:
     * 1 = very matte, 0.4 = clearly see-through with a soft blur. Default 0.8.
     */
    glassOpacity?: number;
    /** Blur radius at glassOpacity = 1. The real blur is `blur * glassOpacity`. */
    blur?: number;
    /** Run the lock animation (pass `isActive` so only the visible page animates). */
    animate?: boolean;
}

/* ----------------------------- Lock icon (24 box) -------------------------- */

const SHACKLE_PATH = 'M8 11 V7.5 A4 4 0 0 1 16 7.5 V11';
const BODY_X = 5;
const BODY_Y = 10;
const BODY_W = 14;
const BODY_H = 11;
const BODY_R = 2.5;

/* ------------------------------ Animation timing --------------------------- */

const CYCLE_MS = 3000; // one full loop: idle → rattle → glint → idle
const SHAKE_START = 0.4; // 0..1 inside the loop
const SHAKE_LEN = 0.22;
const GLINT_START = 0.6;
const GLINT_LEN = 0.2;
const CYCLE_FIRST = 0.36; // when the page becomes active, the first rattle comes almost right away

/* -------------------------------------------------------------------------- */
/*              Layer 1 — static glass (blurred image, tint, bevel)           */
/*     Lives in its own Canvas so it is NOT redrawn on every animation frame  */
/* -------------------------------------------------------------------------- */

interface BackdropProps {
    width: number;
    height: number;
    radius: number;
    imageUri?: string | null;
    colors: GlassColors;
    glassOpacity: number;
    blur: number;
}

const GlassBackdrop = memo(function GlassBackdrop({
    width,
    height,
    radius,
    imageUri,
    colors,
    glassOpacity,
    blur,
}: BackdropProps) {
    const image = useImage(imageUri ?? null);
    const imageFade = useSharedValue(0);

    useEffect(() => {
        imageFade.value = withTiming(image ? 1 : 0, { duration: 600 });
    }, [image, imageFade]);

    const clip = useMemo(() => rrect(rect(0, 0, width, height), radius, radius), [width, height, radius]);

    const m = Math.min(Math.max(glassOpacity, 0), 1);
    const effectiveBlur = Math.max(blur * m, 0.1);

    return (
        <Canvas style={{ width, height }}>
            <Group clip={clip}>
                {/* Solid base: good look while the image loads / if it fails */}
                <Rect x={0} y={0} width={width} height={height} color={colors[1]} />

                {/* The image itself, blurred in proportion to the matte level */}
                <Image image={image} x={0} y={0} width={width} height={height} fit="cover" opacity={imageFade}>
                    <Blur blur={effectiveBlur} mode="clamp" />
                </Image>

                {/* Glass tint */}
                <Group opacity={m}>
                    <Rect x={0} y={0} width={width} height={height}>
                        <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={colors} />
                    </Rect>
                </Group>

                {/* Milky veil (scales with matte level) */}
                <Rect x={0} y={0} width={width} height={height} color="white" opacity={0.12 * m} />

                {/* Frosted grain */}
                <Rect x={0} y={0} width={width} height={height} opacity={0.08 * m}>
                    <FractalNoise freqX={0.9} freqY={0.9} octaves={2} seed={7} />
                </Rect>

                {/* Diagonal light */}
                <Rect x={0} y={0} width={width} height={height}>
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(width * 0.85, height * 0.65)}
                        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']}
                        positions={[0, 0.45, 1]}
                    />
                </Rect>

                {/* Depth toward the bottom */}
                <Rect x={0} y={height * 0.55} width={width} height={height * 0.45} opacity={m}>
                    <LinearGradient
                        start={vec(0, height * 0.55)}
                        end={vec(0, height)}
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.26)']}
                    />
                </Rect>

                {/* Specular line on the top edge */}
                <Rect x={radius} y={0} width={Math.max(width - radius * 2, 0)} height={1.5}>
                    <LinearGradient
                        start={vec(radius, 0)}
                        end={vec(width - radius, 0)}
                        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0)']}
                    />
                </Rect>

                {/* Beveled glass edge */}
                <RoundedRect
                    x={0.75}
                    y={0.75}
                    width={width - 1.5}
                    height={height - 1.5}
                    r={Math.max(radius - 0.75, 0)}
                    style="stroke"
                    strokeWidth={1.5}
                >
                    <LinearGradient
                        start={vec(0, 0)}
                        end={vec(width, height)}
                        colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.10)', 'rgba(255,255,255,0.30)']}
                    />
                </RoundedRect>
            </Group>
        </Canvas>
    );
});

/* -------------------------------------------------------------------------- */
/*       Layer 2 — game-style gold lock: pop-in, rattle, glint (Reanimated)    */
/* -------------------------------------------------------------------------- */

interface AnimatedLayerProps {
    width: number;
    height: number;
    animate: boolean;
}

const GlassAnimatedLayer = memo(function GlassAnimatedLayer({ width, height, animate }: AnimatedLayerProps) {
    const cx = width / 2;
    const cy = height / 2;
    const s = (Math.min(width, height) * 0.4) / 24; // icon scale (24-unit box)

    const bodyClip = useMemo(
        () => rrect(rect(BODY_X, BODY_Y, BODY_W, BODY_H), BODY_R, BODY_R),
        [],
    );

    const intro = useSharedValue(0); // pop-in on mount
    const cycle = useSharedValue(0); // 0..1 loop that drives rattle + glint
    const breathe = useSharedValue(0); // very subtle idle scale

    // Pop-in: springs in with a small overshoot
    useEffect(() => {
        intro.value = withDelay(150, withSpring(1, { damping: 9, stiffness: 150, mass: 0.8 }));
        return () => cancelAnimation(intro);
    }, [intro]);

    useEffect(() => {
        if (animate) {
            cycle.value = CYCLE_FIRST;
            cycle.value = withSequence(
                withTiming(1, { duration: CYCLE_MS * (1 - CYCLE_FIRST), easing: Easing.linear }),
                withRepeat(
                    withSequence(
                        withTiming(0, { duration: 0 }),
                        withTiming(1, { duration: CYCLE_MS, easing: Easing.linear }),
                    ),
                    -1,
                    false,
                ),
            );
            breathe.value = withRepeat(
                withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
                -1,
                true,
            );
        } else {
            cancelAnimation(cycle);
            cancelAnimation(breathe);
            cycle.value = 0;
            breathe.value = withTiming(0, { duration: 400 });
        }
        return () => {
            cancelAnimation(cycle);
            cancelAnimation(breathe);
        };
    }, [animate, cycle, breathe]);

    // Damped oscillation: the "locked!" rattle (−1..1, 0 outside its window)
    const shake = useDerivedValue(() => {
        const t = (cycle.value - SHAKE_START) / SHAKE_LEN;
        if (t <= 0 || t >= 1) return 0;
        return Math.sin(t * Math.PI * 10) * Math.pow(1 - t, 1.6);
    });

    const popTransform = useDerivedValue(() => [
        { scale: (0.6 + 0.4 * intro.value) * (1 + 0.03 * breathe.value) },
    ]);
    const introOpacity = useDerivedValue(() => Math.min(1, intro.value * 1.6));
    const lockRotation = useDerivedValue(() => [{ rotate: shake.value * 0.22 }]);
    const shackleRotation = useDerivedValue(() => [{ rotate: -shake.value * 0.32 }]);

    // A white glint that slides across the gold body after the rattle
    const glintTransform = useDerivedValue(() => {
        const g = (cycle.value - GLINT_START) / GLINT_LEN;
        if (g <= 0 || g >= 1) return [{ translateX: -40 }, { rotate: 0.35 }];
        const e = g * g * (3 - 2 * g); // smoothstep
        return [{ translateX: -10 + 44 * e }, { rotate: 0.35 }];
    });

    return (
        <Canvas style={{ width, height }}>
            <Group opacity={introOpacity}>
                <Group transform={popTransform} origin={vec(cx, cy)}>
                    <Group
                        transform={[
                            { translateX: cx - 12 * s },
                            { translateY: cy - 11.5 * s },
                            { scale: s },
                        ]}
                    >
                        <Group transform={lockRotation} origin={vec(12, 21)}>
                            {/* Silver shackle (pivots around its right foot) */}
                            <Group transform={shackleRotation} origin={vec(16, 11)}>
                                <Path
                                    path={SHACKLE_PATH}
                                    style="stroke"
                                    strokeWidth={2.4}
                                    strokeCap="round"
                                    strokeJoin="round"
                                >
                                    <LinearGradient
                                        start={vec(8, 3)}
                                        end={vec(16, 11)}
                                        colors={['#FFFFFF', '#B3BCCB', '#8995AA']}
                                    />
                                    <Shadow dx={0} dy={1} blur={1.4} color="rgba(0,0,0,0.45)" />
                                </Path>
                            </Group>

                            {/* Gold body */}
                            <RoundedRect x={BODY_X} y={BODY_Y} width={BODY_W} height={BODY_H} r={BODY_R}>
                                <LinearGradient
                                    start={vec(BODY_X, BODY_Y)}
                                    end={vec(BODY_X + BODY_W, BODY_Y + BODY_H)}
                                    colors={['#FFE9A3', '#F7C548', '#C98A12']}
                                />
                                <Shadow dx={0} dy={1} blur={1.6} color="rgba(0,0,0,0.5)" />
                            </RoundedRect>
                            {/* Top highlight */}
                            <RoundedRect x={BODY_X} y={BODY_Y} width={BODY_W} height={BODY_H} r={BODY_R}>
                                <LinearGradient
                                    start={vec(0, BODY_Y)}
                                    end={vec(0, BODY_Y + BODY_H)}
                                    colors={['rgba(255,255,255,0.40)', 'rgba(255,255,255,0)']}
                                    positions={[0, 0.6]}
                                />
                            </RoundedRect>
                            {/* Dark rim */}
                            <RoundedRect
                                x={BODY_X}
                                y={BODY_Y}
                                width={BODY_W}
                                height={BODY_H}
                                r={BODY_R}
                                style="stroke"
                                strokeWidth={0.6}
                                color="rgba(122,78,5,0.7)"
                            />

                            {/* Keyhole */}
                            <Circle cx={12} cy={14.6} r={1.6} color="#6B4304" />
                            <RoundedRect x={11.15} y={14.8} width={1.7} height={3.4} r={0.8} color="#6B4304" />

                            {/* Glint, clipped to the body */}
                            <Group clip={bodyClip}>
                                <Group transform={glintTransform}>
                                    <Rect x={0} y={-12} width={4} height={48}>
                                        <LinearGradient
                                            start={vec(0, 0)}
                                            end={vec(4, 0)}
                                            colors={[
                                                'rgba(255,255,255,0)',
                                                'rgba(255,255,255,0.85)',
                                                'rgba(255,255,255,0)',
                                            ]}
                                        />
                                    </Rect>
                                </Group>
                            </Group>
                        </Group>
                    </Group>
                </Group>
            </Group>
        </Canvas>
    );
});

/* -------------------------------------------------------------------------- */
/*                                   Public                                   */
/* -------------------------------------------------------------------------- */

function LockedGlassOverlay({
    width,
    height,
    radius = 18,
    imageUri,
    colors = ['#3a4668', '#1b2138', '#2a3354'],
    glassOpacity = 0.8,
    blur = 10,
    animate = true,
}: Props) {
    return (
        <View pointerEvents="none" style={{ width, height, borderRadius: radius, overflow: 'hidden' }}>
            <GlassBackdrop
                width={width}
                height={height}
                radius={radius}
                imageUri={imageUri}
                colors={colors}
                glassOpacity={glassOpacity}
                blur={blur}
            />
            <View style={StyleSheet.absoluteFill}>
                <GlassAnimatedLayer width={width} height={height} animate={animate} />
            </View>
        </View>
    );
}

export default memo(LockedGlassOverlay);