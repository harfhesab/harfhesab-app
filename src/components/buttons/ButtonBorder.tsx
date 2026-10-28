import React, { memo } from 'react';
import { View, Text, TouchableNativeFeedback } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import Font from '../../utils/Font';
import { DotIndicator, MaterialIndicator } from 'react-native-indicators';
import useAppTheme from '../../hooks/theme/useAppTheme';
import Icon from '../../utils/Icon';
import usePressAnimation from '../../hooks/animation/usePressAnimation';
import { vibrate } from '../../utils/vibrationManager';

const colors = useAppTheme();

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
    justifyContent?: "center" | "flex-end" | "flex-start" | "space-around" | "space-between" | "space-evenly";
    flexDirection?: "row" | "row-reverse";
    textColor?: string;
    CustomContent?: any;
}
function ButtonBorder({
    loading,
    loadingType,
    onPress,
    borderRadius = 8,
    borderWidth = 0.75,
    borderColor = colors.primary.a3,
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
    flexDirection = "row",
    textColor = colors.primary.a3,
    CustomContent
}:Props) {

    const { pressed, onPressIn, onPressOut, pressStyle } = usePressAnimation({ pressedScale: 0.95, pressedTranslateY: 1 });

    const baseColor = borderColor ?? colors.primary.a1;

    // با لمس، کادر از حالت کم‌رنگ به رنگ کامل می‌رود
    const borderAnimStyle = useAnimatedStyle(() => ({
        borderColor: interpolateColor(pressed.value, [0, 1], [`${baseColor}99`, baseColor]),
    }));

    // پر شدن نرم داخل دکمه با رنگ کادر
    const fillStyle = useAnimatedStyle(() => ({
        opacity: interpolate(pressed.value, [0, 1], [0, 0.18]),
    }));

    const renderLoading = () => (
        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            {
                !loadingType ?
                    <DotIndicator color={borderColor ?? colors.primary.a1} count={3} size={7} /> :
                    loadingType == "DotIndicator" ?
                        <DotIndicator color={borderColor ?? colors.primary.a1} count={3} size={7} /> :
                        loadingType == "MaterialIndicator" &&
                        <MaterialIndicator color={borderColor ?? colors.primary.a1} trackWidth={3} size={25} />
            }
        </View>
    )

    const click = ()=>{
        vibrate({pattern:40})
        onPress()
    }

    return (
        <Animated.View style={[{
            borderRadius: borderRadius,
            width: width,
            height: height,
            overflow: 'hidden',
            borderWidth: borderWidth,
            borderColor: `${borderColor}99`,
            backgroundColor: borderColor ? `${borderColor}15` : `${colors.primary.a1}15`
        }, pressStyle, borderAnimStyle]}>
            <Animated.View
                pointerEvents="none"
                style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: baseColor }, fillStyle]}
            />
            <TouchableNativeFeedback
                disabled={loading}
                onPress={click}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                useForeground={false} 
                background={TouchableNativeFeedback.Ripple(colors.border.a1, false)}
            >
                <View style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {
                        (loading == true) ?
                            (renderLoading())
                            :
                            ((iconName && iconType) || CustomContent) ?
                            (<View style={{ flexDirection: flexDirection, alignItems: 'center', width: '100%', justifyContent: justifyContent, paddingHorizontal: 15, gap: 15 }}>
                                <Text style={{ fontFamily: fontFamily, fontSize: textSize, color: textColor }}>{text}</Text>
                                {
                                    CustomContent ?
                                        <CustomContent />
                                        :
                                        <Icon name={iconName} type={iconType} style={{ fontSize: iconSize, color: textColor }} />
                                }
                            </View>)
                            :
                            (<View style={{ width: '100%', alignItems: 'center' }}>
                                <Text style={{ fontFamily: fontFamily, fontSize: textSize, color: textColor, textAlign: 'center' }}>{text}</Text>
                                {
                                    text2 &&
                                    <Text style={{ fontFamily: Font.bakh_semi_bold, fontSize: 12, color: textColor, textAlign: 'center' }}>{text2}</Text>
                                }
                            </View>)
                    }
                </View>
            </TouchableNativeFeedback>
        </Animated.View>
    )
}
export default memo(ButtonBorder);