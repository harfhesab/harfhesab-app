import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, I18nManager } from 'react-native';
import Icon from '../../utils/Icon';
import Font from '../../utils/Font';
import useAppTheme from '../../hooks/theme/useAppTheme';
import { priceDigitSeperator } from '../../utils/PriceDigitSeperator';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

const width = Dimensions.get('window').width;

const RatingGraph = ({ number_rating, reviews, index }) => {
    const colors = useAppTheme();
    const maxWidth = width - 185;
    const RTL = I18nManager.isRTL;

    const output = reviews > 0 ? (number_rating / reviews) * maxWidth : 0;

    const animatedWidth = useSharedValue(0);

    useEffect(() => {
        animatedWidth.value = 0;

        animatedWidth.value = withTiming(output, {
            duration: 2500,
        });
    }, [reviews, number_rating]);

    const animStyle = useAnimatedStyle(() => {
        return {
            width: animatedWidth.value,
            alignSelf: RTL ? 'flex-end' : 'flex-start',
        };
    });

    return (
        <View style={{ height: 20, width: width - 120, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <View style={{ width: 40, height: 20, alignItems: 'flex-end', justifyContent: 'center', marginEnd: 5 }}>
                <Text style={{ fontSize: 10, color: colors.text.a6, fontFamily: Font.medium }}>
                    {number_rating > 0 ? priceDigitSeperator(number_rating) : number_rating}
                </Text>
            </View>
            <View style={[{ borderRadius: 5 }, { width: maxWidth, height: 10, backgroundColor: colors.border.a1, overflow: 'hidden' }]}>
                {reviews > 0 && (
                    <Animated.View
                        style={[
                            animStyle,
                            {
                                height: 10,
                                backgroundColor: colors.primary.a1,
                                borderRadius: 5,
                            }
                        ]}
                    />
                )}
            </View>
            <View style={{ width: 25, height: 20, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:2 }}>
                <Icon name='star' type='AntDesign' style={{ fontSize: 12, color: colors.border.a1 }} />
                <Text style={{ fontSize: 10, color: colors.text.a6, fontFamily: Font.black }}>{index}</Text>
            </View>
        </View>
    );
};

export default React.memo(RatingGraph);
