# SandTimer

A performance-first, resumable hourglass component for React Native, built
with `@shopify/react-native-skia` + `react-native-reanimated`.

## Usage

```jsx
import SandTimer from './sand-timer/SandTimer';

// Fresh 10-minute countdown
<SandTimer totalSeconds={600} onFinish={() => console.log('done')} />

// Resume a 10-minute countdown that already has 3 minutes left
// (e.g. the player left the game and came back)
<SandTimer totalSeconds={600} remainingSeconds={180} />

// Paused (e.g. game paused menu is open)
<SandTimer totalSeconds={600} remainingSeconds={180} paused />
```

## Files

| File | Responsibility |
|---|---|
| `geometry.js` | Builds the glass silhouette + bezier lookup tables (LUTs), once per size. |
| `sandMath.js` | Worklet math helpers shared by piles + grains (curve lookups, easing). |
| `SandPiles.js` | Top (draining) and bottom (growing) sand shapes, gradient-filled. |
| `Grains.js` | The small fixed-count falling-grain stream. |
| `HourglassFrame.js` | Static decorative frame: wood caps, rods, shadow, glass tint/highlight. |
| `SandTimer.js` | Wires everything together; the component you actually import. |

## Props

| Prop | Default | Notes |
|---|---|---|
| `totalSeconds` | — (required) | Full duration the hourglass represents. |
| `remainingSeconds` | `totalSeconds` | How much time is left right now — set this to start mid-way through. |
| `width` / `height` | `160` / `240` | Canvas size. |
| `paused` | `false` | Freezes the sand level AND the falling grains. |
| `grainCount` | `14` | Number of animated falling grains. |
| `sandColors` | `['#f3d493','#dba84e','#a97a30']` | `[light, mid, dark]` gradient stops. |
| `frameColor` / `frameColorDark` | brown tones | Wood cap colors. |
| `glassTint` | soft blue-white | Translucent tint over the glass body. |
| `onFinish` | — | Called once when the countdown reaches zero. |

## Performance notes

- All ticking happens in `useFrameCallback` on the UI thread — React never
  re-renders while the timer runs, and it isn't affected by JS-thread
  congestion from the rest of a heavy game screen.
- The two sand paths and `grainCount` grains are rebuilt every frame, but
  each is cheap: a handful of `lineTo`/`quadTo` calls and a ~24-point curve
  lookup, not a particle simulation.
- If you still see frame drops on lower-end Android devices, the cheapest
  things to dial back first are, in order: `grainCount` (try 6–8), the
  `BlurMask` ground shadow in `HourglassFrame.js` (blur is relatively more
  expensive on some Android GPUs — you can just remove that one shape), and
  the `LUT_STEPS` constant in `geometry.js` (try 16).

## Honest limitations

- This is **not** a per-grain physics simulation. Real grain-by-grain
  collision/pile physics (thousands of particles with proper angle-of-repose
  behavior) is not practical at 60fps on a mobile game screen — see the
  discussion earlier in this project. What you get instead is a procedural
  approximation driven purely by elapsed-time fraction, which is why the
  timing itself is exact while the sand *motion* is a (good-looking) fake.
- The bottom pile's shape is a smooth, symmetric heap every time — real sand
  piles are slightly irregular/random. Not attempted here to keep the cost
  near zero; could be faked further with a per-instance random wobble on the
  peak position if wanted.
- Only tested by reasoning/code-review, not by actually running it (no RN
  device/simulator available in this environment). Please try it in your
  project and report anything that doesn't render as expected — Skia's exact
  prop names/behavior can vary slightly across versions.
