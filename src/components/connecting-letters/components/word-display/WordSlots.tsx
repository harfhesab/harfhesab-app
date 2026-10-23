import React, { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useDerivedValue } from 'react-native-reanimated';
import { Canvas, Group, Picture, RoundedRect, Skia, type Transforms3d } from '@shopify/react-native-skia';
import { useLettersStatic } from '../../context/LettersContext';
import { computeSlotsLayout, type SlotsLayout } from '../../logic/slotsLayout';
import { SLOT_COLORS } from '../../constants/theme';
import { onUIThread } from '../../utils/worklet';
import { createSlotItem, createSlotKit, drawSlots } from './slotPictures';

const AREA_PADDING = 18;
const PANEL_PADDING = 10;
const PANEL_RADIUS = 16;
/** ناحیه‌ای زیر هدر که دکمه‌ی کلمات پنهان اشغال کرده است (TopHeader را ببینید). */
const HIDDEN_WORDS_BUTTON_ZONE = { width: 56, height: 62 };
const OFFSET: Transforms3d = [{ translateX: AREA_PADDING }, { translateY: AREA_PADDING }];

/**
 * خانه‌ها، بعد از این‌که اندازه‌ی ناحیه معلوم شد. همه‌ی خانه‌ها یک تصویر (Picture) هستند که روی
 * UI thread از `SlotEffects` ساخته می‌شود؛ پیدا شدن کلمه یا استفاده از راهنما هیچ رندر React‌ای نمی‌خواهد.
 */
const SlotsCanvas = memo(function SlotsCanvas({ layout, width, height }: { layout: SlotsLayout; width: number; height: number }) {
  const { typeface, slotFx } = useLettersStatic();
  const { reveal, hints, hintPop, settled } = slotFx;

  const items = useMemo(() => {
    const wordKit = createSlotKit(layout.rows[0]?.size ?? 0, 'word', typeface);
    const rows = layout.rows.map(row => createSlotItem(row, wordKit));
    return layout.main ? [...rows, createSlotItem(layout.main, createSlotKit(layout.main.size, 'main', typeface))] : rows;
  }, [layout, typeface]);
  const bounds = useMemo(() => Skia.XYWHRect(0, 0, width, height), [width, height]);
  // فریم اول روی JS از وضعیت ثابت (`settled`) کشیده می‌شود، بدون خواندن shared valueها از UI thread.
  const [initial] = useState(() => drawSlots(items, [...settled.reveal], [...settled.hints], null, bounds));
  const picture = useDerivedValue(() => {
    if (!onUIThread()) {
      return initial;
    }
    return drawSlots(
      items,
      reveal.map(value => value.value),
      hints.map(value => value.value),
      hintPop.map(value => value.value),
      bounds,
    );
  });

  const panel = {
    x: layout.bounds.x - PANEL_PADDING,
    y: layout.bounds.y - PANEL_PADDING,
    width: layout.bounds.width + PANEL_PADDING * 2,
    height: layout.bounds.height + PANEL_PADDING * 2,
  };

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Group transform={OFFSET}>
        <RoundedRect {...panel} r={PANEL_RADIUS} color={SLOT_COLORS.panel} />
        <RoundedRect {...panel} r={PANEL_RADIUS} style="stroke" strokeWidth={1} color={SLOT_COLORS.panelLine} />
        <Picture picture={picture} />
      </Group>
    </Canvas>
  );
});

/**
 * خانه‌های خالیِ همه‌ی کلمه‌هایی که باید پیدا شوند. کل فضای داده‌شده را پر می‌کند و تعداد ستونی را
 * انتخاب می‌کند که بزرگ‌ترین خانه‌ها را بدهد (`computeSlotsLayout`).
 */
function WordSlots() {
  const { model } = useLettersStatic();
  const [area, setArea] = useState<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setArea(prev => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  const layout = useMemo(
    () =>
      area &&
      computeSlotsLayout({
        words: model.targetWords,
        mainWord: model.mainWord,
        width: area.width - AREA_PADDING * 2,
        height: area.height - AREA_PADDING * 2,
        obstacle: {
          width: HIDDEN_WORDS_BUTTON_ZONE.width - AREA_PADDING,
          height: HIDDEN_WORDS_BUTTON_ZONE.height - AREA_PADDING,
        },
      }),
    [area, model],
  );
  const hasSlots = layout !== null && (layout.rows.length > 0 || layout.main !== null);

  return (
    <View style={styles.area} onLayout={onLayout} pointerEvents="none">
      {area && layout && hasSlots && <SlotsCanvas layout={layout} width={area.width} height={area.height} />}
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    width: '100%',
    zIndex: 1000000,
  },
});

export default memo(WordSlots);
