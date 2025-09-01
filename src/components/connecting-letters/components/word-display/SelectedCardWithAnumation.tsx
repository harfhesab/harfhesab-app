import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  SharedValue,
} from 'react-native-reanimated';
import { StyleSheet, Text } from 'react-native';
import Font from '../../../../utils/Font';

interface CardWithAnimationProps {
    item: string;
    index: number;
    CARD_WIDTH: number;
    CARD_FONT_SIZE: number;
    feedbackProgress: SharedValue<number>;
}
const FEEDBACK_STATE = {
  NORMAL: 0,
  SUCCESS: 1,
  ERROR: 2,
  DUPLICATE: 3,
};
const COLORS = {
  NORMAL: "#86442d",
  SUCCESS: "#0ea960",
  ERROR: "#CC0000",
  DUPLICATE: "#0099CC",
};
const SelectedCardWithAnumation = ({ item, CARD_WIDTH, CARD_FONT_SIZE, feedbackProgress }: CardWithAnimationProps) => {
    const scale = useSharedValue(0);
    
    useEffect(() => {
        scale.value = withSpring(1, { stiffness: 180, damping: 12 });
    }, []);

    const animatedCardStyle = useAnimatedStyle(() => {
    return {
        transform: [{ scale: scale.value }],
        backgroundColor: interpolateColor(
            feedbackProgress.value,
            [FEEDBACK_STATE.NORMAL, FEEDBACK_STATE.SUCCESS, FEEDBACK_STATE.ERROR, FEEDBACK_STATE.DUPLICATE],
            [COLORS.NORMAL, COLORS.SUCCESS, COLORS.ERROR, COLORS.DUPLICATE]
        ),
    };
    });

    return (
        <Animated.View style={[styles.card, animatedCardStyle, { width: CARD_WIDTH, height: CARD_WIDTH }]}>
            <Text style={[styles.cardText, { fontSize: CARD_FONT_SIZE }]}>{item}</Text>
        </Animated.View>
    );
};
const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardText: {
    fontFamily: Font.bakh_extra_black,
    color: '#FFF',
  },
});


export default React.memo(SelectedCardWithAnumation);