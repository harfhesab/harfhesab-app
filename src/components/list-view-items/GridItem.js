import React, {useState, memo, useEffect, useCallback, useMemo} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withTiming, withSpring} from 'react-native-reanimated';
import Font from '../../utils/Font';
import useAppTheme from '../../hooks/theme/useAppTheme';
import LocalImageComponent from '../image-components/LocalImageComponent';
import AdvancedImageComponent from '../image-components/AdvancedImageComponent';
// این دو کامپوننت از صفحه‌ی Home آمده‌اند؛ اگر جای دیگری استفاده می‌شوند بهتر است به یک پوشه‌ی مشترک (مثلاً components/common) منتقل شوند
import GlassVeil from '../home-parts/components/GlassVeil';
import SelectedFrame from '../SelectedFrame';
import CardBadge from '../home-parts/components/CardBadge';

const RADIUS = 15;
const BORDER_W = 0.5; // ضخامت بوردر کارت؛ به قاب Skia و هاله هم داده می‌شود تا دقیق روی لبه بنشینند
const PRESS_SCALE = 0.96; // وقتی لمس می‌شود، آیتم تا ۹۶٪ کوچک می‌شود

/**
 * آیتم گرید.
 *
 * `disabled === true`:
 *   - هاله‌ی شیشه‌ای Skia روی آیتم می‌نشیند (ظاهر غیرفعال)
 *   - مثل قبل، با لمس فقط `onPress` صدا زده می‌شود (مثلاً برای نمایش toast «به‌زودی»)
 *     و حالت انتخاب/حذف اجرا نمی‌شود.
 */
function GridItem({
    onPress,
    disabled = undefined,
    title,
    description,
    image,
    localImage,
    width,
    height,
    selected,
    iconName = 'layers',
    iconType = 'Ionicons',
    deletedItem,
    selectedItem,
    disabledDeleteItem,
    blank_background,
    badge,
}) {
    const colors = useAppTheme();
    const [select, setSelect] = useState(selected);
    const isInactive = disabled === true;
    const hasBadge = Boolean(badge && badge.length > 0);

    useEffect(() => {
        setSelect(selected);
    }, [selected]);

    /* ───────── انیمیشن فشردن ───────── */
    const scale = useSharedValue(1);
    const scaleStyle = useAnimatedStyle(() => ({transform: [{scale: scale.value}]}));
    const onPressIn = useCallback(() => {
        scale.value = withTiming(PRESS_SCALE, {duration: 90});
    }, []);
    const onPressOut = useCallback(() => {
        scale.value = withSpring(1, {damping: 12, stiffness: 220});
    }, []);

    /* ───────── منطق کلیک (بدون تغییر نسبت به قبل) ───────── */
    const onClick = useCallback(() => {
        if (disabled == true) {
            onPress?.();
        } else if (select == true) {
            if (disabledDeleteItem == true) return;
            setSelect(false);
            setTimeout(() => {
                deletedItem?.();
            }, 100);
        } else {
            setSelect(true);
            setTimeout(() => {
                if (selectedItem?.() == false) {
                    setSelect(false);
                }
            }, 100);
        }
    }, [disabled, onPress, select, disabledDeleteItem, deletedItem, selectedItem]);

    /* ───────── استایل‌ها ───────── */
    const cardStyle = useMemo(
        () => ({
            // وقتی انتخاب شده، قاب Skia جای بوردر را می‌گیرد؛ ضخامت ثابت می‌ماند تا محتوا جابه‌جا نشود
            borderColor: select ? 'transparent' : colors.border.a1,
            borderWidth: BORDER_W,
            backgroundColor: select ? `${colors.primary.a1}15` : 'transparent',
        }),
        [select, colors.primary.a1, colors.border.a1],
    );
    const imageBoxStyle = useMemo(() => ({backgroundColor: `${colors.primary.a2}25`, borderRadius: 13}), [colors.primary.a2]);
    const titleStyle = useMemo(
        () => ({fontFamily: Font.bakh_semi_bold, color: colors.text.a2, fontSize: 13, width: width - 20, textAlign: 'center', lineHeight: 20}),
        [colors.text.a2, width],
    );
    const descriptionStyle = useMemo(
        () => ({fontFamily: Font.bakh_semi_bold, color: colors.text.a6, fontSize: 8, width: width - 20, textAlign: 'center', lineHeight: 15}),
        [colors.text.a6, width],
    );
    const ripple = useMemo(() => ({color: colors.border.a1, borderless: false}), [colors.border.a1]);

    return (
        <Animated.View style={scaleStyle}>
            <View style={[styles.clip, {width, height}]}>
                <Pressable
                    onPress={onClick}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    android_ripple={ripple}
                    accessibilityRole="button"
                    accessibilityState={{selected: Boolean(select), disabled: isInactive}}
                    accessibilityLabel={`${title ?? ''}${hasBadge ? `، ${badge}` : ''}`}
                    style={[styles.card, cardStyle]}>
                    <View style={imageBoxStyle}>
                        {localImage == true ? (
                            <LocalImageComponent
                                path={image}
                                width={width - 20}
                                height={width - 20}
                                resizeMode={'cover'}
                                borderRadius={13}
                                style={styles.image}
                                blank_background
                            />
                        ) : (
                            <AdvancedImageComponent
                                uri={image}
                                width={width - 20}
                                height={width - 20}
                                resizeMode={'cover'}
                                borderRadius={13}
                                style={styles.image}
                                iconName={iconName}
                                iconType={iconType}
                                iconSize={width / 2}
                            />
                        )}
                    </View>
                    <View style={styles.textBox}>
                        {title ? <Text style={titleStyle}>{title}</Text> : null}
                        {description ? <Text style={descriptionStyle}>{description}</Text> : null}
                    </View>

                    {/* قاب انتخاب (فقط وقتی select است) */}
                    {select ? <SelectedFrame width={width} height={height} radius={RADIUS} offset={BORDER_W} /> : null}

                    {/* هاله‌ی شیشه‌ای (فقط disabled): داخل Pressable است تا لمس حتماً به onPress برسد */}
                    {isInactive ? <GlassVeil width={width} height={height} radius={RADIUS} offset={BORDER_W} /> : null}
                </Pressable>

            </View>

            {/* باکس badge بیرون از ناحیه‌ی clip تا گوشه‌ی آیتم را کمی بشکند و بالای هاله بماند */}
            {hasBadge ? <CardBadge label={badge} style={styles.badge} /> : null}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    clip: {borderRadius: RADIUS, overflow: 'hidden'},
    card: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 10,
        width: '100%',
        height: '100%',
        gap: 10,
        borderRadius: RADIUS,
    },
    image: {borderRadius: 10},
    textBox: {width: '100%', alignItems: 'center', paddingHorizontal: 10, flex: 1, justifyContent: 'space-between'},
    badge: {top: 5, end: 5},
});

export default memo(GridItem);