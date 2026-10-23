import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated from 'react-native-reanimated';

// نوار نور از چند باریکه با شفافیت‌های مختلف ساخته شده تا شبیه گرادیان دیده شود: [عرض، شفافیت]
const STRIPS = [
    [14, 0.05],
    [12, 0.12],
    [10, 0.28],
    [12, 0.12],
    [14, 0.05],
];
const STRIP_STYLES = STRIPS.map(([width, alpha]) => ({width, backgroundColor: `rgba(255,243,210,${alpha})`}));

export const LIGHT_BAND_W = STRIPS.reduce((sum, [w]) => sum + w, 0);

/**
 * نوار نور مورب، فقط با View معمولی (بدون Canvas اضافه).
 * absolute و چسبیده به لبه‌ی start والد است؛ حرکت، چرخش و شفافیت را والد با style انیمیشنی می‌دهد.
 * والد باید overflow: 'hidden' و borderRadius داشته باشد تا نور از گوشه‌ها بیرون نزند.
 *
 * استفاده: درخشش بعد از فرود کارت (IntroReveal) و نور زیر انگشت (GameCard)
 */
export default function LightBand({height, style}) {
    return (
        <Animated.View pointerEvents="none" style={[styles.band, {height}, style]}>
            {STRIP_STYLES.map((stripStyle, i) => (
                <View key={i} style={stripStyle} />
            ))}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    band: {position: 'absolute', start: 0, width: LIGHT_BAND_W, flexDirection: 'row'},
});
