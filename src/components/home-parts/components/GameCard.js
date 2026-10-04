import React, {memo, useCallback, useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
    Canvas,
    Circle,
    Group,
    LinearGradient,
    Rect,
    RoundedRect,
    Shadow,
    rect,
    rrect,
    vec,
} from '@shopify/react-native-skia';
import {CARD_R, GOLD, INSET, SLOT_R} from '../homeConfig';
import {getGeometry, mirrorX} from '../homeGeometry';
import CardBadge from './CardBadge';
import GlassVeil from './GlassVeil';
import FeaturedAura from './FeaturedAura';
import LocalImageComponent from '../../image-components/LocalImageComponent';
import DynamicProSkiaText from '../../text-components/DynamicProSkiaText';
import { colors } from '../../../hooks/theme/colors';
import Font from '../../../utils/Font';

/**
 * کارت بازی.
 *
 * قانون RTL: Skia مختصات فیزیکی (از چپ) می‌خواهد، پس با mirrorX وارونه می‌شود؛
 * ویوهای RN با `start` / `end` جای‌گذاری می‌شوند (نه left/right که در RTL جابه‌جا می‌شوند).
 * به این ترتیب قاب Skia، تصویر و متن همیشه روی هم می‌افتند.
 *
 * ترتیب لایه‌ها: کانواس ثابت ← تصویر ← متن ← هاله‌ی ویژه (فقط featured)
 *                ← هاله‌ی شیشه‌ای (فقط غیرفعال) ← باکس badge
 *
 * `time` فقط برای کارت‌های featured استفاده می‌شود (انیمیشن هاله).
 */
const GameCard = memo(function GameCard({item, width, height, mode, time, onPress}) {
    const active = item.active !== false;
    const featured = Boolean(item.featured) && active;
    const {slot, text} = useMemo(() => getGeometry(width, height, mode), [width, height, mode]);
    const clip = useMemo(() => rrect(rect(0, 0, width, height), CARD_R, CARD_R), [width, height]);
    const handlePress = useCallback(() => onPress(item.route), [onPress, item.route]);

    // مختصات فیزیکی برای Skia
    const slotX = mirrorX(slot.x, slot.size, width);
    const medallionX = mirrorX(text.x, text.width, width) + text.width / 2;

    // badge: گوشه‌ی بالا-end (روی تصویر در حالت ستونی)
    const badgeOffset = mode === 'row' ? INSET : INSET + 8;
    const hasBadge = Boolean(item.badge);

    // اندازه‌ی عنوان؛ کارت ویژه دو واحد درشت‌تر
    const baseTitleSize = mode === 'row' ? (item.title?.length > 14 ? 20 : 24) : (item.title?.length > 14 ? 18 : 22);
    const titleSize = baseTitleSize + (featured ? 2 : 0);

    return (
        <Pressable
            disabled={!active}
            accessibilityRole="button"
            accessibilityState={{disabled: !active}}
            accessibilityLabel={
                `${item.title}${item.subtitle ? `، ${item.subtitle}` : ''}${hasBadge ? `، ${item.badge}` : ''}`
            }
            onPress={handlePress}
            style={({pressed}) => [{width, height}, pressed && styles.pressed]}>
            <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
                <Group clip={clip}>
                    <Rect x={0} y={0} width={width} height={height}>
                        <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={item.colors} />
                    </Rect>

                    {/* مدالیون محو */}
                    <Circle cx={medallionX} cy={height * 0.55} r={height * 0.62} style="stroke" strokeWidth={1.5} color="rgba(255,255,255,0.07)" />
                    <Circle cx={medallionX} cy={height * 0.55} r={height * 0.42} style="stroke" strokeWidth={1.5} color="rgba(255,255,255,0.07)" />

                    {/* براقی بالا */}
                    <Rect x={0} y={0} width={width} height={height * 0.45}>
                        <LinearGradient start={vec(0, 0)} end={vec(0, height * 0.45)} colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']} />
                    </Rect>

                    {/* نوار متن در حالت ستونی */}
                    {mode === 'column' && (
                        <Rect x={0} y={text.y} width={width} height={height - text.y} color="rgba(0,0,0,0.28)" />
                    )}

                    {/* سایه و قاب طلایی دور تصویر */}
                    <RoundedRect x={slotX} y={slot.y} width={slot.size} height={slot.size} r={SLOT_R} color="black">
                        <Shadow dx={0} dy={5} blur={9} color="rgba(0,0,0,0.55)" shadowOnly />
                    </RoundedRect>
                    <RoundedRect
                        x={slotX - 3}
                        y={slot.y - 3}
                        width={slot.size + 6}
                        height={slot.size + 6}
                        r={SLOT_R + 3}
                        style="stroke"
                        strokeWidth={2.5}>
                        <LinearGradient start={vec(slotX, slot.y)} end={vec(slotX + slot.size, slot.y + slot.size)} colors={GOLD} />
                    </RoundedRect>
                </Group>

                <RoundedRect x={0.75} y={0.75} width={width - 1.5} height={height - 1.5} r={CARD_R} style="stroke" strokeWidth={1.5} color="rgba(255,255,255,0.2)" />
            </Canvas>

            {/* تصویر مربعی ۱:۱ (RN، با start به‌جای left) */}
            <View
                style={[
                    styles.slot,
                    {
                        start: slot.x,
                        top: slot.y,
                        width: slot.size,
                        height: slot.size,
                        backgroundColor: item.image ? 'transparent' : item.placeholder,
                    },
                ]}>
                <LocalImageComponent
                    path={item.image}
                    width={slot.size}
                    height={slot.size}
                    resizeMode={'stretch'}
                    blank_background={true}
                />
            </View>

            {/* متن */}
            <View
                pointerEvents="none"
                style={[
                    styles.textBox,
                    {
                        gap:3,
                        start: text.x,
                        top: text.y,
                        width: text.width,
                        height: text.height,
                        // در حالت row، متن زیر باکس badge شروع شود تا روی هم نیفتند
                        paddingTop: mode === 'row' && hasBadge ? 24 : 0,
                    },
                ]}>
                <DynamicProSkiaText
                    text={item.title}
                    maxWidth={text.width}
                    textColor={colors.primary.a7} 
                    borderColor={"#FFFFFF"}
                    fontName='YekanBakh-ExtraBlack' 
                    borderWidth={1}
                    fontSize={titleSize}
                />
                {item.subtitle ? (
                    <Text style={[styles.subtitle, {fontFamily:Font.bakh_semi_bold}]} numberOfLines={3}>
                        {item.subtitle}
                    </Text>
                ) : null}
            </View>

            {/* هاله‌ی جلب‌توجه (فقط featured) */}
            {featured ? (
                <FeaturedAura
                    width={width}
                    height={height}
                    slotX={slotX}
                    slotY={slot.y}
                    slotSize={slot.size}
                    time={time}
                />
            ) : null}

            {/* هاله‌ی شیشه‌ای روی همه‌چیز (فقط غیرفعال) */}
            {!active ? <GlassVeil width={width} height={height} /> : null}

            {/* باکس badge بالای هاله تا واضح بماند */}
            {hasBadge ? (
                <CardBadge label={item.badge} style={{top: badgeOffset, end: badgeOffset}} />
            ) : null}
        </Pressable>
    );
});

const styles = StyleSheet.create({
    pressed: {opacity: 0.9, transform: [{scale: 0.97}]},
    slot: {
        position: 'absolute',
        borderRadius: SLOT_R,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textBox: {position: 'absolute', justifyContent: 'center'},
    subtitle: {color: colors.primary.a5, opacity: 0.85, fontSize: 12, lineHeight: 16, marginTop: 2},
});

export default GameCard;