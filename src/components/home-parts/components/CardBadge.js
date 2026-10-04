import React, {memo, useCallback, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Canvas, LinearGradient, RoundedRect, vec} from '@shopify/react-native-skia';
import {GOLD} from '../homeConfig';
import Font from '../../../utils/Font';

/**
 * باکس متنی گوشه‌ی کارت (مثلاً «به زودی»).
 * اندازه‌ی پس‌زمینه‌ی Skia از اندازه‌ی واقعی متن (onLayout) گرفته می‌شود،
 * پس با هر طول متن و هر فونتی درست می‌شود.
 *
 * موقعیت‌دهی (top / end) را والد انجام می‌دهد.
 */
const CardBadge = memo(function CardBadge({label, style}) {
    const [size, setSize] = useState(null);

    const onLayout = useCallback(e => {
        const {width, height} = e.nativeEvent.layout;
        setSize(prev => (prev && prev.w === width && prev.h === height ? prev : {w: width, h: height}));
    }, []);

    return (
        <View onLayout={onLayout} style={[styles.box, style]} pointerEvents="none">
            {size ? (
                <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
                    <RoundedRect x={0.75} y={0.75} width={size.w - 1.5} height={size.h - 1.5} r={size.h / 2}>
                        <LinearGradient start={vec(0, 0)} end={vec(size.w, size.h)} colors={['#3B2D0C', '#1C1405']} />
                    </RoundedRect>
                    <RoundedRect x={0.75} y={0.75} width={size.w - 1.5} height={size.h - 1.5} r={size.h / 2} style="stroke" strokeWidth={1.5}>
                        <LinearGradient start={vec(0, 0)} end={vec(size.w, size.h)} colors={GOLD} />
                    </RoundedRect>
                </Canvas>
            ) : null}
            <Text style={[styles.text, {fontFamily:Font.bakh_semi_bold}]} numberOfLines={1}>
                {label}
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    box: {
        position: 'absolute',
        paddingHorizontal: 11,
        paddingVertical: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {color: '#FFD666', fontSize: 11},
});

export default CardBadge;