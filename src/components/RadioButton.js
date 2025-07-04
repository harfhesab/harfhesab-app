import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Animated, Easing } from "react-native";
import { useTheme } from '@react-navigation/native';

function RadioButton({ selected, onPress, size, borderWidth, color, disabled }) {
    const {colors} = useTheme().colors;
    const [selectedState, setSelectedState] = useState(selected);

    const finalSize = size ?? 20;
    const borderSize = borderWidth ?? 1.5;
    const radioSize = finalSize - ((borderSize * 2) + 6);

    const scaleAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;
    const opacityAnim = useRef(new Animated.Value(selected ? 1 : 0)).current;

    useEffect(() => {
        setSelectedState(selected);

        if (selected) {
            scaleAnim.setValue(0);
            opacityAnim.setValue(1); // آماده برای نمایش

            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2, // کمی بزرگتر از حالت نرمال
                    duration: 180,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 5,
                    tension: 100,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            // اول کمی بزرگ‌تر، بعد به صفر
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.1,
                    duration: 80,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 220,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                })
            ]).start(() => {
                opacityAnim.setValue(0); // بعد حذفش کن
            });
        }
    }, [selected]);

    const select = () => {
        if (disabled) return;
        setSelectedState(true);
        const time = setTimeout(() => {
            onPress?.();
            clearTimeout(time);
        }, 100);
    };

    return (
        <TouchableOpacity disabled={disabled} onPress={select} activeOpacity={0.7}>
            <View
                style={{
                    borderRadius: finalSize / 2,
                    borderWidth: borderSize,
                    borderColor: color ?? colors.check_box.color,
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: finalSize,
                    height: finalSize
                }}
            >
                <Animated.View
                    style={{
                        width: radioSize,
                        height: radioSize,
                        borderRadius: radioSize / 2,
                        backgroundColor: color ?? colors.check_box.color,
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                    }}
                />
            </View>
        </TouchableOpacity>
    );
}

export default React.memo(RadioButton);