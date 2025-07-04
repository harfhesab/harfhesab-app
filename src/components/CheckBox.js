import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, Animated, Easing } from "react-native";
import Icon from "../utils/Icon";
import { useTheme } from "@react-navigation/native";

function CheckBox({ check, onPress, size, borderRadius, borderWidth, color, disabled }) {
    const { colors } = useTheme().colors;
    const [checkState, setCheckState] = useState(check);
    const [visibleCheck, setVisibleCheck] = useState(check);
    const finalSize = size ?? 25;

    const scaleAnim = useRef(new Animated.Value(check ? 1 : 0)).current;
    const bgAnim = useRef(new Animated.Value(check ? 1 : 0)).current;

    useEffect(() => {
        setCheckState(check);

        // animate background color
        Animated.timing(bgAnim, {
            toValue: check ? 1 : 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();

        if (check) {
            setVisibleCheck(true);
            scaleAnim.setValue(0);
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                friction: 5,
                tension: 120,
            }).start();
        } else {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.3,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 150,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setVisibleCheck(false);
            });
        }
    }, [check]);

    const change = () => {
        if (disabled) return;
        const newState = !checkState;
        setCheckState(newState);
        const time = setTimeout(() => {
            onPress?.(newState);
            clearTimeout(time);
        }, 100);
    };

    // interpolate background color between "transparent" and active color
    const backgroundColor = bgAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["transparent", color ?? colors.check_box.color],
    });

    return (
        <TouchableOpacity disabled={disabled} onPress={change} activeOpacity={0.7}>
            <Animated.View
                style={{
                    borderRadius: borderRadius ?? 5,
                    borderWidth: borderWidth ?? 1.5,
                    borderColor: color ?? colors.check_box.color,
                    alignItems: "center",
                    justifyContent: "center",
                    width: finalSize,
                    height: finalSize,
                    backgroundColor: backgroundColor,
                }}
            >
                {visibleCheck && (
                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                        <Icon
                            name="check"
                            type="FontAwesome6"
                            style={{
                                color: colors.check_box.check,
                                fontSize: finalSize * 0.8,
                            }}
                        />
                    </Animated.View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
}

export default React.memo(CheckBox);
