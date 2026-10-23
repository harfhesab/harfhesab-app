import React, {memo, useCallback, useMemo, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Canvas, LinearGradient, RoundedRect, vec} from '@shopify/react-native-skia';
import Font from '../../../utils/Font';

const MAX_TAGS = 3; // بیشتر از این شلوغ می‌شود

/**
 * پس‌زمینه‌ی Skia یک چیپ (فقط المان‌ها، مختصات محلی خود چیپ).
 * هم در کانواس اختصاصی TagChip و هم داخل کانواس بدنه‌ی کارت (CardSurface) رسم می‌شود.
 */
export const ChipBackground = ({w, h}) => (
    <>
        <RoundedRect x={0.5} y={0.5} width={w - 1} height={h - 1} r={h / 2}>
            <LinearGradient
                start={vec(0, 0)}
                end={vec(0, h)}
                colors={['rgba(16,38,40,0.85)', 'rgba(4,14,16,0.85)']}
            />
        </RoundedRect>
        <RoundedRect x={0.5} y={0.5} width={w - 1} height={h - 1} r={h / 2} style="stroke" strokeWidth={1}>
            <LinearGradient
                start={vec(0, 0)}
                end={vec(w, h)}
                colors={['rgba(255,226,150,0.9)', 'rgba(201,142,31,0.5)']}
            />
        </RoundedRect>
    </>
);

/**
 * یک چیپ شیشه‌ای تیره با قاب طلایی ظریف و لوزی کوچک طلایی در ابتدا.
 * پس‌زمینه‌ی Skia اندازه‌ی واقعی متن (onLayout) را می‌گیرد، پس با هر طول متنی درست می‌شود.
 * لوزی یک View معمولی است تا در RTL خودکار سمت درست قرار بگیرد.
 *
 * اگر onChipLayout داده شود، چیپ کانواس خودش را نمی‌سازد و فقط جای خودش را گزارش می‌دهد؛
 * پس‌زمینه را والد (کانواس بدنه‌ی کارت) می‌کشد. هر Canvas در اندروید یک TextureView جداست.
 */
const TagChip = memo(function TagChip({label, compact, index, onChipLayout}) {
    const [size, setSize] = useState(null);

    const onLayout = useCallback(
        e => {
            const {x, y, width, height} = e.nativeEvent.layout;
            if (onChipLayout) {
                onChipLayout(index, {x, y, w: width, h: height});
                return;
            }
            setSize(prev => (prev && prev.w === width && prev.h === height ? prev : {w: width, h: height}));
        },
        [index, onChipLayout],
    );

    return (
        <View onLayout={onLayout} style={[styles.chip, compact && styles.chipCompact]}>
            {size && !onChipLayout ? (
                <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
                    <ChipBackground w={size.w} h={size.h} />
                </Canvas>
            ) : null}
            {compact ? null : <View style={styles.diamond} />}
            <Text style={[styles.text, compact && styles.textCompact]} numberOfLines={1}>
                {label}
            </Text>
        </View>
    );
});

/**
 * ردیف تگ‌های کارت (item.tags). داخل جریان عادی چیدمان است (زیر زیرعنوان) و موقعیت absolute ندارد.
 *
 * compact: نسخه‌ی کوچک‌تر بدون لوزی، برای ستون‌های باریک (کارت‌های small) تا دو تگ در یک ردیف جا شوند.
 * کاملاً غیرتعاملی است و لمس را نمی‌گیرد.
 *
 * onChipsLayout (اختیاری): ([{x, y, w, h}]) => void — جای هر چیپ نسبت به والد همین ردیف (فیزیکی، از چپ).
 * اگر داده شود چیپ‌ها کانواس اختصاصی نمی‌سازند و والد باید پس‌زمینه‌شان (ChipBackground) را بکشد.
 */
const CardTags = memo(function CardTags({tags, compact = false, style, onChipsLayout}) {
    const shown = useMemo(() => (tags ? tags.slice(0, MAX_TAGS) : []), [tags]);
    const rowRef = useRef(null);
    const chipsRef = useRef([]);

    const report = useCallback(() => {
        const row = rowRef.current;
        const chips = chipsRef.current;
        if (!onChipsLayout || !row || shown.some((_, i) => !chips[i])) {
            return;
        }
        onChipsLayout(shown.map((_, i) => ({...chips[i], x: row.x + chips[i].x, y: row.y + chips[i].y})));
    }, [onChipsLayout, shown]);

    const onRowLayout = useCallback(
        e => {
            const {x, y} = e.nativeEvent.layout;
            rowRef.current = {x, y};
            report();
        },
        [report],
    );

    const onChipLayout = useCallback(
        (i, box) => {
            chipsRef.current[i] = box;
            report();
        },
        [report],
    );

    if (shown.length === 0) {
        return null;
    }
    return (
        <View
            pointerEvents="none"
            onLayout={onChipsLayout ? onRowLayout : undefined}
            style={[styles.row, style]}>
            {shown.map((tag, i) => (
                <TagChip
                    key={tag}
                    label={tag}
                    compact={compact}
                    index={i}
                    onChipLayout={onChipsLayout ? onChipLayout : undefined}
                />
            ))}
        </View>
    );
});

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 3,
    },
    chipCompact: {
        gap: 0,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    diamond: {
        width: 5,
        height: 5,
        backgroundColor: '#FFD666',
        transform: [{rotate: '45deg'}],
    },
    text: {
        color: '#FFE9A8',
        fontSize: 10.5,
        lineHeight: 15,
        fontFamily: Font.bakh_semi_bold,
        includeFontPadding: false,
    },
    textCompact: {
        fontSize: 9.5,
        lineHeight: 14,
    },
});

export default CardTags;
