import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useDerivedValue } from 'react-native-reanimated';
import { Canvas, Picture, Skia } from '@shopify/react-native-skia';
import { useLettersStatic } from '../../context/LettersContext';
import { TILE_FONT_RATIO, TILE_IDLE, TILE_PICKED } from '../../constants/theme';
import { onUIThread } from '../../utils/worklet';
import BoardBackdrop from './BoardBackdrop';
import { createTileSet, drawTiles } from './tilePictures';

/**
 * زمین بازی: یک Canvasِ Skia پس‌زمینه و همه‌ی کارت‌ها را می‌کشد و یک gesture handler لمس‌ها را
 * روی UI thread مستقیماً با وضعیت زنده‌ی شبیه‌سازی می‌سنجد. چندلمسی پشتیبانی می‌شود، پس
 * می‌توان با هر دو شست حرف انتخاب کرد.
 *
 * طرح هر کارت یک بار ضبط می‌شود و هر فریم فقط یک تصویر (Picture) از جای کارت‌ها ساخته می‌شود؛
 * کل صفحه یک ورودی متحرک دارد، نه چند ورودی برای هر کارت.
 */
function LetterBoard() {
  const { model, metrics, typeface, engine } = useLettersStatic();
  const { width, height, padding, tileSize } = metrics;
  const { bodies, initialBodies, count, pickAt } = engine;

  const tiles = useMemo(
    () =>
      createTileSet(
        model.letters,
        tileSize,
        typeface ? Skia.Font(typeface, tileSize * TILE_FONT_RATIO) : null,
        { idle: TILE_IDLE, picked: TILE_PICKED },
        padding,
        Skia.XYWHRect(0, 0, width, height),
      ),
    [model.letters, tileSize, typeface, padding, width, height],
  );
  // فریم اول روی JS از وضعیت اولیه کشیده می‌شود، بدون خواندن bodies از UI thread.
  const picture = useDerivedValue(() => drawTiles(onUIThread() ? bodies.value : initialBodies, count, tiles));

  const gesture = useMemo(
    () =>
      Gesture.Manual()
        .onTouchesDown((event, manager) => {
          'worklet';
          manager.activate();
          for (let i = 0; i < event.changedTouches.length; i++) {
            const touch = event.changedTouches[i];
            pickAt(touch.x - padding, touch.y - padding);
          }
        })
        .onTouchesUp((event, manager) => {
          'worklet';
          if (event.numberOfTouches === 0) {
            manager.end();
          }
        })
        .onTouchesCancelled((_event, manager) => {
          'worklet';
          manager.fail();
        }),
    [pickAt, padding],
  );

  const boardSize = useMemo(() => ({ width, height }), [width, height]);

  return (
    <GestureHandlerRootView style={boardSize}>
      <GestureDetector gesture={gesture}>
        <View style={boardSize} collapsable={false}>
          <Canvas style={StyleSheet.absoluteFill}>
            <BoardBackdrop width={width} height={height} />
            <Picture picture={picture} />
          </Canvas>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

export default memo(LetterBoard);
