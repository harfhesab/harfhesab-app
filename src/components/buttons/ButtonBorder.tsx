import React, { memo, useMemo } from 'react';
import { View, Text, TouchableNativeFeedback } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import Font from '../../utils/Font';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import useAppTheme from '../../hooks/theme/useAppTheme';
import Icon from '../../utils/Icon';
import usePressAnimation from '../../hooks/animation/usePressAnimation';
import { vibrate } from '../../utils/vibrationManager';

const TRANSPARENT = 'rgba(0,0,0,0)';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * آلفا را به رنگ اعمال می‌کند، بدون اینکه رنگ نامعتبر بسازد.
 * پشتیبانی: transparent، hex (۳، ۶ و ۸ رقمی)، rgb و rgba.
 * برای بقیه (مثل نام رنگ‌ها) همان رنگ ورودی برگردانده می‌شود تا هرگز رنگ نامعتبر ساخته نشود.
 */
const withAlpha = (color: string | undefined, alpha: number): string => {
    if (!color || color === 'transparent') {
        return TRANSPARENT;
    }
    const c = color.trim();

    if (c.startsWith('#')) {
        let hex = c.slice(1);
        if (hex.length === 3 || hex.length === 4) {
            hex = hex.split('').map(ch => ch + ch).join('');
        }
        if ((hex.length === 6 || hex.length === 8) && /^[0-9a-fA-F]+$/.test(hex)) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
            return `rgba(${r},${g},${b},${clamp01(a * alpha).toFixed(3)})`;
        }
        return c;
    }

    const m = c.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
    if (m) {
        const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
        return `rgba(${m[1]},${m[2]},${m[3]},${clamp01(a * alpha).toFixed(3)})`;
    }

    return c;
};

// رنگ کامل: transparent را به شکل قابل‌اتکا برای Reanimated برمی‌گرداند
const solid = (color: string): string => (color === 'transparent' ? TRANSPARENT : color);

interface Props {
    loading?: boolean;
    loadingType?: string;
    onPress?: any;
    borderRadius?: number;
    borderWidth?: any;
    borderColor?: string;
    width?: number;
    height?: number;
    text?: string;
    text2?: string;
    iconName?: string;
    iconType?: string;
    iconSize?: number;
    textSize?: number;
    fontFamily?: string;
    justifyContent?: 'center' | 'flex-end' | 'flex-start' | 'space-around' | 'space-between' | 'space-evenly';
    flexDirection?: 'row' | 'row-reverse';
    textColor?: string;
    CustomContent?: any;
}

function ButtonBorder({
    loading,
    loadingType,
    onPress,
    borderRadius = 8,
    borderWidth = 0.75,
    borderColor,
    width,
    height,
    text,
    text2,
    iconName,
    iconType,
    iconSize = 25,
    textSize = 16,
    fontFamily = Font.bakh_semi_bold,
    justifyContent = 'center',
    flexDirection = 'row',
    textColor,
    CustomContent,
}: Props) {
    // هوک باید داخل کامپوننت صدا زده شود (نه سطح ماژول)
    const colors = useAppTheme();

    const { pressed, onPressIn, onPressOut, pressStyle } = usePressAnimation({
        pressedScale: 0.95,
        pressedTranslateY: 1,
    });

    const resolvedBorderColor = borderColor ?? colors.primary.a3;
    const resolvedTextColor = textColor ?? colors.primary.a3;

    // همه‌ی رنگ‌ها بیرون از worklet و به‌صورت رشته‌ی معتبر محاسبه می‌شوند
    const { baseColor, dimColor, bgColor } = useMemo(
        () => ({
            baseColor: solid(resolvedBorderColor),
            dimColor: withAlpha(resolvedBorderColor, 0.6),
            bgColor: withAlpha(resolvedBorderColor, 0.08),
        }),
        [resolvedBorderColor],
    );

    // با لمس، کادر از حالت کم‌رنگ به رنگ کامل می‌رود
    const borderAnimStyle = useAnimatedStyle(() => ({
        borderColor: interpolateColor(pressed.value, [0, 1], [dimColor, baseColor]),
    }));

    // پر شدن نرم داخل دکمه با رنگ کادر
    const fillStyle = useAnimatedStyle(() => ({
        opacity: interpolate(pressed.value, [0, 1], [0, 0.18]),
    }));

    const loaderColor = resolvedBorderColor === 'transparent' ? colors.primary.a3 : resolvedBorderColor;

    const renderLoading = () => (
        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {loadingType === 'MaterialIndicator' ? (
                <MaterialIndicator color={loaderColor} trackWidth={3} size={25} />
            ) : (
                <DotIndicator color={loaderColor} count={3} size={7} />
            )}
        </View>
    );

    const click = () => {
        vibrate({ pattern: 40 });
        onPress?.();
    };

    return (
        <Animated.View
            style={[
                {
                    borderRadius: borderRadius,
                    width: width,
                    height: height,
                    overflow: 'hidden',
                    borderWidth: borderWidth,
                    borderColor: dimColor,
                    backgroundColor: bgColor,
                },
                pressStyle,
                borderAnimStyle,
            ]}>
            <Animated.View
                pointerEvents="none"
                style={[
                    { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: baseColor },
                    fillStyle,
                ]}
            />
            <TouchableNativeFeedback
                disabled={loading}
                onPress={click}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                useForeground={false}
                background={TouchableNativeFeedback.Ripple(colors.border.a1, false)}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    {loading === true ? (
                        renderLoading()
                    ) : (iconName && iconType) || CustomContent ? (
                        <View
                            style={{
                                flexDirection: flexDirection,
                                alignItems: 'center',
                                width: '100%',
                                justifyContent: justifyContent,
                                paddingHorizontal: 15,
                                gap: 15,
                            }}>
                            <Text style={{ fontFamily: fontFamily, fontSize: textSize, color: resolvedTextColor }}>
                                {text}
                            </Text>
                            {CustomContent ? (
                                <CustomContent />
                            ) : (
                                <Icon
                                    name={iconName}
                                    type={iconType}
                                    style={{ fontSize: iconSize, color: resolvedTextColor }}
                                />
                            )}
                        </View>
                    ) : (
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <Text
                                style={{
                                    fontFamily: fontFamily,
                                    fontSize: textSize,
                                    color: resolvedTextColor,
                                    textAlign: 'center',
                                }}>
                                {text}
                            </Text>
                            {!!text2 && (
                                <Text
                                    style={{
                                        fontFamily: Font.bakh_semi_bold,
                                        fontSize: 12,
                                        color: resolvedTextColor,
                                        textAlign: 'center',
                                    }}>
                                    {text2}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
            </TouchableNativeFeedback>
        </Animated.View>
    );
}

export default memo(ButtonBorder);