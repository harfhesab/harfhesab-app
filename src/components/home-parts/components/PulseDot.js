import React, {memo} from 'react';
import {Canvas, Circle} from '@shopify/react-native-skia';
import {useDerivedValue} from 'react-native-reanimated';

const SIZE = 32;
const C = SIZE / 2;

/**
 * نقطه‌ی پالسی «جدید».
 * عمداً کانواس کوچک و مستقل دارد: اگر داخل کانواس کارت بود، انیمیشنش هر فریم
 * کل کارت (گرادیان‌ها و سایه‌ها) را دوباره رسم می‌کرد. حالا کارت ثابت می‌ماند.
 *
 * props: x, y = مرکز نقطه در مختصات کارت؛ time = SharedValue میلی‌ثانیه
 */
const PulseDot = memo(function PulseDot({x, y, time}) {
    const r = useDerivedValue(() => 7 + 6 * ((time.value % 1600) / 1600));
    const o = useDerivedValue(() => 0.55 * (1 - (time.value % 1600) / 1600));

    return (
        <Canvas
            pointerEvents="none"
            style={{position: 'absolute', left: x - C, top: y - C, width: SIZE, height: SIZE}}>
            <Circle cx={C} cy={C} r={r} color="#E5482F" opacity={o} />
            <Circle cx={C} cy={C} r={6.5} color="#E5482F" />
            <Circle cx={C} cy={C} r={6.5} style="stroke" strokeWidth={2} color="rgba(255,255,255,0.9)" />
        </Canvas>
    );
});

export default PulseDot;
