// مسیر پیشنهادی: src/utils/GameTabBar.js  (کنار Icon و Font)
import React, {useEffect, useRef, useState} from 'react';
import {
  I18nManager,
  ImageBackground,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {Blur, Canvas, LinearGradient, RoundedRect, vec} from '@shopify/react-native-skia';
import Icon from '../utils/Icon';
import Font from '../utils/Font';

const ICON_BACKGROUND = require('../assets/image/circle_red_frame.png');

const BAR_HEIGHT = 78;
const H_PAD = 10; // فاصله‌ی افقی کل تب‌ها از لبه‌ی صفحه
const V_PAD = 10; // فاصله‌ی عمودی کپسول از بالا و پایین
const GAP = 4; // فاصله‌ی کپسول از لبه‌ی هر تب
const HL_HEIGHT = BAR_HEIGHT - V_PAD * 2;
const RADIUS = 22;
const ICON_SIZE = 24;
const ANIM_DURATION = 200;
const SPRING = {damping: 20, stiffness: 220, mass: 0.9};
const ACTIVE_LABEL_COLOR = '#FFFFFF';

// رنگ #RRGGBB (یا #RRGGBBAA) را با آلفای دلخواه برمی‌گرداند
const withAlpha = (color, alpha) => {
  const m = typeof color === 'string' ? /^#([0-9a-f]{6})/i.exec(color) : null;
  if (!m) {
    return color;
  }
  return `#${m[1]}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')}`;
};

/** کپسول فعال که با Skia کشیده می‌شود: گرادیان، لبه‌ی درخشان و خط نور بالا */
const Highlight = ({width, height, accent}) => (
  <Canvas style={{width, height}}>
    <RoundedRect x={0} y={0} width={width} height={height} r={RADIUS}>
      <LinearGradient
        start={vec(0, 0)}
        end={vec(0, height)}
        colors={[withAlpha(accent, 0.38), withAlpha(accent, 0.08)]}
      />
    </RoundedRect>
    <RoundedRect
      x={0.5}
      y={0.5}
      width={width - 1}
      height={height - 1}
      r={RADIUS}
      style="stroke"
      strokeWidth={1}>
      <LinearGradient
        start={vec(0, 0)}
        end={vec(width, height)}
        colors={[withAlpha(accent, 0.85), withAlpha(accent, 0.15)]}
      />
    </RoundedRect>
    <RoundedRect x={width * 0.28} y={1} width={width * 0.44} height={3} r={1.5} color={accent}>
      <Blur blur={2} />
    </RoundedRect>
  </Canvas>
);

const TabItem = ({focused, inactiveColor, iconActive, iconInactive, label, onPressIn, onLongPress}) => {
  const progress = useSharedValue(focused ? 1 : 0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {duration: ANIM_DURATION});
  }, [focused, progress]);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{scale: interpolate(pressed.value, [0, 1], [1, 0.94])}],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0.55, 1]),
    transform: [{scale: interpolate(progress.value, [0, 1], [0.9, 1.08])}],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [inactiveColor, ACTIVE_LABEL_COLOR]),
  }));

  const frameSize = ICON_SIZE * 1.6;

  return (
    <Pressable
      style={styles.item}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{selected: focused}}
      // تب همان لحظه‌ی لمس عوض می‌شود، نه بعد از رها کردن انگشت
      onPressIn={() => {
        pressed.value = withTiming(1, {duration: 90});
        onPressIn();
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, {duration: 140});
      }}
      onLongPress={onLongPress}>
      <Animated.View
        style={[
          styles.content,
          {flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'},
          contentStyle,
        ]}>
        <Animated.View style={iconStyle}>
          <ImageBackground
            source={ICON_BACKGROUND}
            style={[styles.iconBg, {width: frameSize, height: frameSize}]}
            imageStyle={{resizeMode: 'stretch'}}
            resizeMode="stretch">
            <Icon
              name={focused ? iconActive : iconInactive}
              type="Ionicons"
              style={{color: focused ? '#FFFFFF' : inactiveColor, fontSize: ICON_SIZE * 0.9}}
            />
          </ImageBackground>
        </Animated.View>
        <Animated.Text
          style={[styles.label, labelStyle]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};

/**
 * props:
 *  - items: {[routeName]: {label, iconActive, iconInactive}}
 *  - accent: رنگ اصلی تم
 *  - backgroundColor, inactiveColor
 *  - absolute: اگر true باشد تب‌بار روی صفحه شناور می‌شود (برای پس‌زمینه‌ی شفاف)
 */
const GameTabBar = ({
  state,
  navigation,
  descriptors,
  items,
  accent,
  backgroundColor = '#120426',
  inactiveColor = '#8E82A6',
  absolute = false,
  hideOnKeyboard = true,
}) => {
  const [barWidth, setBarWidth] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const x = useSharedValue(0);
  const ready = useSharedValue(0);
  const initialized = useRef(false);

  const count = state.routes.length;
  // در حالت RTL اولین تب باید سمت راست باشد؛ چون کانتینر را LTR کرده‌ایم، ترتیب را خودمان برعکس می‌کنیم
  const visualRoutes = I18nManager.isRTL ? [...state.routes].reverse() : state.routes;
  const focusedKey = state.routes[state.index].key;
  const visualIndex = visualRoutes.findIndex(r => r.key === focusedKey);

  const tabWidth = barWidth > 0 ? (barWidth - H_PAD * 2) / count : 0;
  const hlWidth = Math.max(tabWidth - GAP * 2, 0);

  useEffect(() => {
    if (!hideOnKeyboard) {
      return undefined;
    }
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [hideOnKeyboard]);

  useEffect(() => {
    if (!tabWidth) {
      return;
    }
    const target = H_PAD + visualIndex * tabWidth + GAP;
    if (!initialized.current) {
      x.value = target; // بار اول بدون انیمیشن
      ready.value = 1;
      initialized.current = true;
    } else {
      x.value = withSpring(target, SPRING);
    }
  }, [tabWidth, visualIndex, x, ready]);

  const highlightStyle = useAnimatedStyle(() => ({
    opacity: ready.value,
    transform: [{translateX: x.value}],
  }));

  if (keyboardVisible) {
    return null;
  }

  const handlePress = route => {
    const event = navigation.emit({type: 'tabPress', target: route.key, canPreventDefault: true});
    if (route.key !== focusedKey && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  const handleLongPress = route => {
    navigation.emit({type: 'tabLongPress', target: route.key});
  };

  return (
    <View
      style={[styles.bar, {backgroundColor}, absolute ? styles.barAbsolute : styles.barElevated]}
      onLayout={e => setBarWidth(e.nativeEvent.layout.width)}>
      {hlWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[styles.highlight, {width: hlWidth}, highlightStyle]}>
          <Highlight width={hlWidth} height={HL_HEIGHT} accent={accent} />
        </Animated.View>
      )}

      <View style={styles.row}>
        {visualRoutes.map(route => {
          const cfg = items?.[route.name] ?? {};
          const label = cfg.label ?? descriptors[route.key]?.options?.title ?? route.name;
          return (
            <TabItem
              key={route.key}
              focused={route.key === focusedKey}
              inactiveColor={inactiveColor}
              iconActive={cfg.iconActive ?? 'ellipse'}
              iconInactive={cfg.iconInactive ?? 'ellipse-outline'}
              label={label}
              onPressIn={() => handlePress(route)}
              onLongPress={() => handleLongPress(route)}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    height: BAR_HEIGHT,
    direction: 'ltr', // جای کپسول را با translateX حساب می‌کنیم؛ این کار از جابه‌جا شدن left/right در RTL جلوگیری می‌کند
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
  barElevated: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  barAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // روی پس‌زمینه‌ی شفاف، سایه‌ی اندروید لکه‌ی تیره می‌اندازد
    elevation: 0,
  },
  row: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
    paddingHorizontal: H_PAD,
  },
  highlight: {
    position: 'absolute',
    top: V_PAD,
    height: HL_HEIGHT,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    maxWidth: '100%',
    paddingHorizontal: 8,
  },
  iconBg: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    fontSize: 12,
    fontFamily: Font.bakh_bold,
    flexShrink: 1,
  },
});

export default GameTabBar;