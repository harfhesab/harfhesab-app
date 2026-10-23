import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    Canvas,
    Circle,
    Group,
    LinearGradient,
    Path,
    PaintStyle,
    Picture,
    RadialGradient,
    Rect,
    Skia,
    rect,
    rrect,
    vec,
} from '@shopify/react-native-skia';
import type { SkCanvas } from '@shopify/react-native-skia';
import Animated, {
    cancelAnimation,
    Easing,
    runOnJS,
    SharedValue,
    useAnimatedStyle,
    useDerivedValue,
    useFrameCallback,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { EFFECT_THEMES, EffectKind, EffectTheme, hexToRgb, ParticleKind, REF_WIDTH, rgba } from './effectThemes';

/*
 * IMPORTANT: the picture itself is never re-drawn or resampled. It is rendered exactly once,
 * by the child you pass in (e.g. <ImageComponent />), and only moved by the camera.
 * Everything else (air, particles, light) is drawn ON TOP of it in a transparent Skia layer.
 */

/* -------------------------------------------------------------------------- */
/*                               Particle model                               */
/* -------------------------------------------------------------------------- */

const KIND_CODE: Record<ParticleKind, number> = { dot: 0, leaf: 1, petal: 2, bokeh: 3 };

interface Particle {
    k: number;
    x: number;
    y: number;
    r: number;
    vy: number;
    vx: number;
    amp: number;
    fq: number;
    ph: number;
    spin: number;
    sph: number;
    a: number;
    c: [number, number, number];
    tw: number;
    gl: number;
}

function mulberry32(seed: number) {
    let a = seed | 0;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function buildParticles(theme: EffectTheme, width: number, seed: number, density: number): Particle[] {
    const k = width / REF_WIDTH;
    const rnd = mulberry32(seed * 7919 + 1337);
    const range = (r: [number, number]) => r[0] + (r[1] - r[0]) * rnd();
    const out: Particle[] = [];

    for (const layer of theme.layers) {
        const count = Math.max(1, Math.round(layer.count * density));
        for (let i = 0; i < count; i++) {
            out.push({
                k: KIND_CODE[layer.kind],
                x: rnd(),
                y: rnd(),
                r: range(layer.size) * k,
                vy: range(layer.speed) * k,
                vx: range(layer.wind) * k,
                amp: range(layer.sway) * k,
                fq: range(layer.swayFreq),
                ph: rnd() * Math.PI * 2,
                spin: range(layer.spin ?? [0, 0]) * (rnd() < 0.5 ? -1 : 1),
                sph: rnd() * Math.PI * 2,
                a: range(layer.alpha),
                c: hexToRgb(layer.colors[Math.floor(rnd() * layer.colors.length)]),
                tw: layer.twinkle ?? 0,
                gl: layer.glow ?? 2.4,
            });
        }
    }
    return out;
}

/* -------------------------------------------------------------------------- */
/*          Particle renderer — runs on the UI thread, one SkPicture          */
/* -------------------------------------------------------------------------- */

function drawParticles(canvas: SkCanvas, t: number, W: number, H: number, ps: Particle[], intensity: number) {
    'worklet';
    if (intensity <= 0.001) return;

    const fill = Skia.Paint();
    fill.setAntiAlias(true);
    const line = Skia.Paint();
    line.setAntiAlias(true);
    line.setStyle(PaintStyle.Stroke);
    const col = new Float32Array(4);

    const m = 40;
    const hs = H + 2 * m;
    const ws = W + 2 * m;
    // Wind gusts: integral of (1 + 0.4·sin(0.45t)) → smooth, deterministic drift
    const gustTime = t + (0.4 * (1 - Math.cos(0.45 * t))) / 0.45;

    for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const y = ((((p.y * hs + p.vy * t) % hs) + hs) % hs) - m;
        const sway = p.amp * Math.sin(t * p.fq + p.ph);
        const x = ((((p.x * ws + p.vx * gustTime + sway) % ws) + ws) % ws) - m;

        let a = p.a * intensity;
        if (p.tw > 0) a *= 1 - p.tw * (0.5 + 0.5 * Math.sin(t * (p.fq * 1.6 + 0.8) + p.ph * 2));

        col[0] = p.c[0] / 255;
        col[1] = p.c[1] / 255;
        col[2] = p.c[2] / 255;

        if (p.k === 0) {
            // Soft dot: two halos + core (pollen, golden dust, fireflies)
            col[3] = a * 0.1;
            fill.setColor(col);
            canvas.drawCircle(x, y, p.r * p.gl, fill);
            col[3] = a * 0.22;
            fill.setColor(col);
            canvas.drawCircle(x, y, p.r * p.gl * 0.55, fill);
            col[3] = a;
            fill.setColor(col);
            canvas.drawCircle(x, y, p.r, fill);
        } else if (p.k === 1 || p.k === 2) {
            // Leaf / petal: a tumbling ellipse
            const ang = t * p.spin + p.sph;
            const tumble = 0.25 + 0.75 * Math.abs(Math.cos(t * p.spin * 0.7 + p.sph * 1.3));
            canvas.save();
            canvas.translate(x, y);
            canvas.rotate(ang * 57.2958, 0, 0);
            if (p.k === 1) {
                canvas.scale(1, 0.5 * tumble);
                col[3] = a;
                fill.setColor(col);
                canvas.drawCircle(0, 0, p.r, fill);
                // central vein
                col[0] *= 0.55;
                col[1] *= 0.55;
                col[2] *= 0.55;
                col[3] = a * 0.7;
                line.setColor(col);
                line.setStrokeWidth(Math.max(0.6, p.r * 0.12));
                canvas.drawLine(-p.r, 0, p.r * 0.9, 0, line);
            } else {
                canvas.scale(0.85, 0.6 * tumble);
                col[3] = a;
                fill.setColor(col);
                canvas.drawCircle(0, 0, p.r, fill);
                col[0] = 1;
                col[1] = 1;
                col[2] = 1;
                col[3] = a * 0.45;
                fill.setColor(col);
                canvas.drawCircle(-p.r * 0.2, -p.r * 0.1, p.r * 0.55, fill);
            }
            canvas.restore();
        } else {
            // Bokeh: large soft disc with a brighter rim
            col[3] = a * 0.55;
            fill.setColor(col);
            canvas.drawCircle(x, y, p.r, fill);
            col[3] = Math.min(1, a * 1.6);
            line.setColor(col);
            line.setStrokeWidth(1.2);
            canvas.drawCircle(x, y, p.r, line);
        }
    }
}

/* -------------------------------------------------------------------------- */
/*          Airflow — thin tapered wisps gliding with the gusts                */
/* -------------------------------------------------------------------------- */

interface Streak {
    y: number;
    x: number;
    len: number;
    vx: number;
    amp: number;
    fq: number;
    ph: number;
    w: number;
    a: number;
    gp: number;
}

function buildStreaks(theme: EffectTheme, width: number, height: number, seed: number): Streak[] {
    const k = width / REF_WIDTH;
    const rnd = mulberry32(seed * 3571 + 91);
    const n = theme.airflow.count;
    return Array.from({ length: n }, (_, i) => ({
        y: ((i + 0.2 + rnd() * 0.6) / n) * height,
        x: rnd(),
        len: (90 + rnd() * 110) * k,
        vx: (55 + rnd() * 55) * k,
        amp: (5 + rnd() * 10) * k,
        fq: 0.6 + rnd() * 0.8,
        ph: rnd() * Math.PI * 2,
        w: 1.3 + rnd() * 1.1,
        a: 0.6 + rnd() * 0.4,
        gp: rnd() * Math.PI * 2,
    }));
}

function drawAirflow(
    canvas: SkCanvas,
    t: number,
    W: number,
    ss: Streak[],
    intensity: number,
    rgb: [number, number, number],
    alpha: number,
) {
    'worklet';
    if (intensity <= 0.001 || alpha <= 0) return;

    const line = Skia.Paint();
    line.setAntiAlias(true);
    line.setStyle(PaintStyle.Stroke);
    const col = new Float32Array([rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, 1]);
    const gustTime = t + (0.4 * (1 - Math.cos(0.45 * t))) / 0.45;
    const N = 12;

    for (let i = 0; i < ss.length; i++) {
        const s = ss[i];
        const span = W + s.len;
        const head = (((s.x * span + s.vx * gustTime) % span) + span) % span;
        const u = head / span;
        const env = Math.pow(Math.sin(Math.PI * u), 1.4); // fades in and out across the picture
        const gust = 0.4 + 0.6 * Math.max(0, Math.sin(t * 0.45 + s.gp)); // wisps swell with the gusts
        const base = alpha * s.a * env * gust * intensity;
        if (base < 0.004) continue;

        line.setStrokeWidth(s.w);
        let px = head - s.len;
        let py = s.y + s.amp * Math.sin(s.ph + t * s.fq);
        for (let j = 1; j <= N; j++) {
            const sp = j / N;
            const x = head - s.len * (1 - sp);
            const y = s.y + s.amp * Math.sin(s.ph + sp * 5.5 + t * s.fq);
            col[3] = base * Math.sin(Math.PI * ((j - 0.5) / N)); // tapered at both ends
            line.setColor(col);
            canvas.drawLine(px, py, x, y, line);
            px = x;
            py = y;
        }
    }
}

/* -------------------------------------------------------------------------- */
/*                                Light pieces                                */
/* -------------------------------------------------------------------------- */

function SunGlow({
    cx,
    cy,
    r,
    hex,
    alpha,
    time,
}: {
    cx: number;
    cy: number;
    r: number;
    hex: string;
    alpha: number;
    time: SharedValue<number>;
}) {
    const opacity = useDerivedValue(() => 0.85 + 0.15 * Math.sin(time.value * 0.6));
    return (
        <Group opacity={opacity}>
            <Circle cx={cx} cy={cy} r={r}>
                <RadialGradient c={vec(cx, cy)} r={r} colors={[rgba(hex, alpha), rgba(hex, 0)]} />
            </Circle>
        </Group>
    );
}

function LightBeam({
    x0,
    w,
    H,
    shift,
    hex,
    alpha,
    phase,
    time,
}: {
    x0: number;
    w: number;
    H: number;
    shift: number;
    hex: string;
    alpha: number;
    phase: number;
    time: SharedValue<number>;
}) {
    const opacity = useDerivedValue(() => alpha * (0.6 + 0.4 * Math.sin(time.value * 0.5 + phase)));
    const d = `M ${x0} 0 L ${x0 + w} 0 L ${x0 + w + shift} ${H} L ${x0 + shift} ${H} Z`;
    return (
        <Path path={d} opacity={opacity}>
            <LinearGradient start={vec(x0, 0)} end={vec(x0 + shift, H)} colors={[rgba(hex, 1), rgba(hex, 0)]} />
        </Path>
    );
}

const BEAM_X = [0.35, 0.55, 0.72, 0.9];
const BEAM_W = [0.12, 0.07, 0.16, 0.09];

/* -------------------------------------------------------------------------- */
/*                                LivingImage                                 */
/* -------------------------------------------------------------------------- */

export interface LivingImageProps {
    width: number;
    height: number;
    radius?: number;
    effect: EffectKind;
    /** Different seed → different particle layout and camera direction (use the item index). */
    seed?: number;
    /** Only the visible page should animate. */
    active: boolean;
    /** Multiplier for the particle count (0.5 for low-end devices). */
    density?: number;
    /** The still image itself (e.g. <ImageComponent />). It is rendered once and never modified. */
    children: React.ReactNode;
}

function LivingImage({ width, height, radius = 18, effect, seed = 0, active, density = 1, children }: LivingImageProps) {
    const theme = EFFECT_THEMES[effect];

    const particles = useMemo(() => buildParticles(theme, width, seed, density), [theme, width, seed, density]);
    const streaks = useMemo(() => buildStreaks(theme, width, height, seed), [theme, width, height, seed]);
    const airflowRgb = useMemo(() => hexToRgb(theme.airflow.color), [theme]);
    const airflowAlpha = theme.airflow.alpha;
    const clip = useMemo(() => rrect(rect(0, 0, width, height), radius, radius), [width, height, radius]);

    // Camera direction differs per image so neighbouring pages never move identically
    const dir = useMemo(() => {
        const a = mulberry32(seed * 104729 + 17)() * Math.PI * 2;
        return { dx: Math.cos(a), dy: Math.sin(a) * 0.6 };
    }, [seed]);

    const time = useSharedValue(0);
    const intensity = useSharedValue(0);
    const camera = useSharedValue(0);

    const frame = useFrameCallback((info) => {
        const dt = Math.min((info.timeSincePreviousFrame ?? 16) / 1000, 0.05);
        time.value += dt;
    }, false);

    const stopFrame = useCallback(() => frame.setActive(false), [frame]);

    useEffect(() => {
        if (active) {
            frame.setActive(true);
            intensity.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) });
            camera.value = withRepeat(
                withTiming(1, { duration: theme.camera.duration, easing: Easing.inOut(Easing.sin) }),
                -1,
                true,
            );
        } else {
            cancelAnimation(camera);
            camera.value = withTiming(0, { duration: 900, easing: Easing.inOut(Easing.cubic) });
            intensity.value = withTiming(0, { duration: 500 }, (finished) => {
                if (finished) runOnJS(stopFrame)();
            });
        }
    }, [active, frame, stopFrame, intensity, camera, theme.camera.duration]);

    useEffect(
        () => () => {
            cancelAnimation(camera);
            cancelAnimation(intensity);
            frame.setActive(false);
        },
        [camera, intensity, frame],
    );

    /*
     * Camera: a slow push-in that drifts toward one corner, with a gentle handheld sway.
     * Only translate + uniform scale (no rotation), so the image stays perfectly crisp.
     * Every term is multiplied by the zoom headroom, so the edges can never show.
     */
    const zoom = theme.camera.zoom;
    const cameraStyle = useAnimatedStyle(() => {
        const c = camera.value;
        const sc = 1 + zoom * c;
        const availX = ((sc - 1) / 2) * width;
        const availY = ((sc - 1) / 2) * height;
        const t = time.value;
        const tx = dir.dx * availX * 0.62 + Math.sin(t * 0.35 + seed) * availX * 0.12;
        const ty = dir.dy * availY * 0.62 + Math.cos(t * 0.27 + seed * 1.7) * availY * 0.12;
        return {
            transform: [{ translateX: tx }, { translateY: ty }, { scale: sc }],
        };
    }, [width, height, dir, zoom, seed]);

    // Air + particles are drawn into a single picture per frame on the UI thread
    const picture = useDerivedValue(() => {
        const recorder = Skia.PictureRecorder();
        const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, width, height));
        drawAirflow(canvas, time.value, width, streaks, intensity.value, airflowRgb, airflowAlpha);
        drawParticles(canvas, time.value, width, height, particles, intensity.value);
        return recorder.finishRecordingAsPicture();
    }, [width, height, particles, streaks, airflowRgb, airflowAlpha]);

    const beams = theme.beams;
    const sun = theme.sun;

    return (
        <View style={{ width, height, borderRadius: radius, overflow: 'hidden' }}>
            {/* The picture, moved only by the camera */}
            <Animated.View style={[{ width, height }, cameraStyle]}>{children}</Animated.View>

            {/* Light + air + particles, in screen space, on a transparent layer */}
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                <Canvas style={{ width, height }}>
                    <Group clip={clip}>
                        {sun && (
                            <SunGlow
                                cx={width * sun.x}
                                cy={height * sun.y}
                                r={width * sun.radius}
                                hex={sun.color}
                                alpha={sun.alpha}
                                time={time}
                            />
                        )}

                        {beams &&
                            Array.from({ length: beams.count }).map((_, i) => (
                                <LightBeam
                                    key={i}
                                    x0={width * BEAM_X[i % BEAM_X.length]}
                                    w={width * BEAM_W[i % BEAM_W.length]}
                                    H={height}
                                    shift={-height * 0.45}
                                    hex={beams.color}
                                    alpha={beams.alpha}
                                    phase={i * 1.7}
                                    time={time}
                                />
                            ))}

                        <Picture picture={picture} />

                        {/* Neutral vignette: depth without changing the colors */}
                        <Rect x={0} y={0} width={width} height={height}>
                            <RadialGradient
                                c={vec(width / 2, height / 2)}
                                r={Math.max(width, height) * 0.78}
                                colors={[rgba(theme.vignette.color, 0), rgba(theme.vignette.color, theme.vignette.alpha)]}
                                positions={[0.55, 1]}
                            />
                        </Rect>
                    </Group>
                </Canvas>
            </View>
        </View>
    );
}

export default memo(LivingImage);