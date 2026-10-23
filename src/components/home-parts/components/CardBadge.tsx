import React, {memo} from 'react';
import {StyleSheet, Text, type ViewStyle} from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // یا expo-linear-gradient
import {GOLD} from '../homeConfig';
import Font from '../../../utils/Font';

type CardBadgeProps = {
    label: string;
    style?: ViewStyle;
};

const FILL = ['#3B2D0C', '#1C1405'];
const DIAGONAL_START = {x: 0, y: 0};
const DIAGONAL_END = {x: 1, y: 1};
const BORDER = 1.5;

const CardBadge = memo(function CardBadge({label, style}: CardBadgeProps) {
    return (
        <LinearGradient
            colors={GOLD}
            start={DIAGONAL_START}
            end={DIAGONAL_END}
            style={[styles.border, style]}
            pointerEvents="none">
            <LinearGradient
                colors={FILL}
                start={DIAGONAL_START}
                end={DIAGONAL_END}
                style={styles.inner}>
                <Text style={styles.text} numberOfLines={1}>
                    {label}
                </Text>
            </LinearGradient>
        </LinearGradient>
    );
});

const styles = StyleSheet.create({
    border: {
        position: 'absolute',
        padding: BORDER,
        borderRadius: 999,
    },
    inner: {
        paddingHorizontal: 11 - BORDER,
        paddingVertical: 3 - BORDER > 0 ? 3 - BORDER : 1,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFD666',
        fontSize: 11,
        fontFamily: Font.bakh_semi_bold,
    },
});

export default CardBadge;