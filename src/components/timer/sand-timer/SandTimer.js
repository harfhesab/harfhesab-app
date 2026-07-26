import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useFrameCallback,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

import { buildGeometry } from './geometry';
import { TopSandPile, BottomSandPile } from './SandPiles';
import { SandStream } from './Grains';
import { HourglassBase, HourglassGlass } from './HourglassFrame';

/**
 * Professional, performance-first hourglass (sand timer) for React Native.
 *
 *  - Resumable: can start at ANY point in its countdown via
 *    `totalSeconds` + `remainingSeconds` — e.g. a player left a 10-minute
 *    game and came back with 3 minutes left: `totalSeconds={600}
 *    remainingSeconds={180}` and the bottom pile is already ~70% full.
 *  - Drift-free: anchored to an absolute timestamp and recomputed from
 *    Date.now() every frame (same technique as Timer.js), so dropped
 *    frames, JS-thread stalls, or app backgrounding never desync it.
 *  - 100% UI-thread: all ticking happens inside `useFrameCallback`; React
 *    never re-renders while it's running. Skia repaints react directly to
 *    the underlying Reanimated shared values.
 *  - The sand silhouette is derived from the SAME bezier control points
 *    used to draw the glass (see geometry.js + sandMath.js), so it hugs
 *    the real glass curve instead of a rough straight-line approximation.
 *  - Still NOT a per-grain physics simulation — see the note in
 *    SandTimer's module docs in the project README for why that's not
 *    practical on a busy game screen. This uses procedural shapes driven
 *    by elapsed-time fraction, plus a small fixed number of animated
 *    grains for the flowing-stream illusion.
 *
 * Props:
 *   totalSeconds       (required) full duration the hourglass represents.
 *   remainingSeconds   how much time is left RIGHT NOW (defaults to
 *                       totalSeconds, i.e. start fresh/full).
 *   width, height       canvas size in px (default 160x240).
 *   paused              freezes both the sand level and the falling grains.
 *   grainCount          number of animated falling grains (default 14).
 *   sandColors          [light, mid, dark] gradient stops for the sand.
 *   frameColor / frameColorDark   wood cap colors.
 *   glassTint           translucent tint color for the glass body.
 *   onFinish            called once when the countdown reaches zero.
 */
export default function SandTimer({
  totalSeconds,
  remainingSeconds = totalSeconds,
  width = 160,
  height = 240,
  paused = false,
  grainCount = 14,
  sandColors = ['#f3d493', '#dba84e', '#a97a30'],
  frameColor = '#6b4226',
  frameColorDark = '#432911',
  glassTint = 'rgba(210,232,240,0.16)',
  onFinish,
}) {
  const geo = useMemo(() => buildGeometry(width, height), [width, height]);

  const startedAt = useSharedValue(anchorFor(totalSeconds, remainingSeconds));
  const progress = useSharedValue(initialProgress(totalSeconds, remainingSeconds));
  const finished = useSharedValue(progress.value >= 1);
  const clock = useSharedValue(0);
  const pausedSV = useSharedValue(paused);

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  // Stable JS-thread function — passed by identifier to runOnJS, never
  // accessed as `ref.current` from inside a worklet (that pattern crashes;
  // see the Timer.js notes for the full explanation).
  const handleFinish = () => {
    onFinishRef.current?.();
  };

  useEffect(() => {
    pausedSV.value = paused;
  }, [paused]);

  // Re-anchor whenever the parent supplies a new remaining/total time —
  // e.g. the player re-entered the game screen with a freshly-known
  // remaining duration.
  useEffect(() => {
    startedAt.value = anchorFor(totalSeconds, remainingSeconds);
    const p = initialProgress(totalSeconds, remainingSeconds);
    progress.value = p;
    finished.value = p >= 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSeconds, remainingSeconds]);

  useFrameCallback((frame) => {
    'worklet';
    if (finished.value || pausedSV.value) return;
    clock.value = frame.timestamp;

    const elapsedMs = Date.now() - startedAt.value;
    const p = Math.min(1, Math.max(0, elapsedMs / (totalSeconds * 1000)));
    progress.value = p;
    if (p >= 1) finished.value = true;
  }, true);

  useAnimatedReaction(
    () => finished.value,
    (isFinished, prev) => {
      if (isFinished && !prev) runOnJS(handleFinish)();
    },
    []
  );

  const grainRadius = Math.max(1.1, width * 0.011);

  return (
    <View style={{ width, height }}>
      <Canvas style={{ width, height }}>
        <HourglassBase geo={geo} frameColor={frameColor} frameColorDark={frameColorDark} />
        <Group clip={geo.outer}>
          <TopSandPile progress={progress} geo={geo} colors={sandColors} />
          <BottomSandPile progress={progress} geo={geo} colors={sandColors} />
          <SandStream
            count={grainCount}
            clock={clock}
            progress={progress}
            geo={geo}
            baseRadius={grainRadius}
          />
        </Group>
        <HourglassGlass geo={geo} glassTint={glassTint} />
      </Canvas>
    </View>
  );
}

function anchorFor(totalSeconds, remainingSeconds) {
  const elapsedAlready = Math.max(0, (totalSeconds || 0) - (remainingSeconds ?? totalSeconds));
  return Date.now() - elapsedAlready * 1000;
}

function initialProgress(totalSeconds, remainingSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return 1;
  const remaining = Math.max(0, Math.min(totalSeconds, remainingSeconds ?? totalSeconds));
  const p = 1 - remaining / totalSeconds;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}
