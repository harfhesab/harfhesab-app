import {
  BOARD_MAX_HEIGHT_RATIO,
  BOARD_MAX_WIDTH,
  BOARD_PADDING,
  BOARD_SIDE_MARGIN,
  COLLISION_RESTITUTION,
  MAX_VELOCITY,
  MIN_VELOCITY,
  PICKED_SCALE,
  PULSE_SECONDS,
  SCALE_SPRING_DAMPING,
  SCALE_SPRING_STIFFNESS,
  SPEED_RELAX_RATE,
  TILE_MAX_COVERAGE,
  TILE_MAX_SIZE,
  TILE_WIDTH_DIVISOR,
} from '../constants/constants';
import type { WorldConfig } from './physics';

export interface BoardMetrics {
  /** اندازه‌ی بیرونی صفحه‌ی بازی (و Canvas آن). */
  width: number;
  height: number;
  /** فاصله‌ی محدوده‌ی حرکتِ مرکز کارت‌ها از لبه‌ی صفحه. */
  padding: number;
  tileSize: number;
  world: WorldConfig;
}

export function computeBoardMetrics(windowWidth: number, windowHeight: number, tileCount: number): BoardMetrics {
  const width = Math.max(0, Math.min(windowWidth - BOARD_SIDE_MARGIN * 2, BOARD_MAX_WIDTH));
  const height = Math.min(width, windowHeight * BOARD_MAX_HEIGHT_RATIO);
  const arenaWidth = Math.max(0, width - BOARD_PADDING * 2);
  const arenaHeight = Math.max(0, height - BOARD_PADDING * 2);
  const tileSize = Math.min(
    TILE_MAX_SIZE,
    arenaWidth / TILE_WIDTH_DIVISOR,
    Math.sqrt((TILE_MAX_COVERAGE * arenaWidth * arenaHeight) / Math.max(1, tileCount)),
  );

  return {
    width,
    height,
    padding: BOARD_PADDING,
    tileSize,
    world: {
      width: arenaWidth,
      height: arenaHeight,
      tileSize,
      minSpeed: MIN_VELOCITY,
      maxSpeed: MAX_VELOCITY,
      speedRelax: SPEED_RELAX_RATE,
      restitution: COLLISION_RESTITUTION,
      pickedScale: PICKED_SCALE,
      stiffness: SCALE_SPRING_STIFFNESS,
      damping: SCALE_SPRING_DAMPING,
      pulseSeconds: PULSE_SECONDS,
    },
  };
}
