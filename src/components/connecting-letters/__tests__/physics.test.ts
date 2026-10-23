import { computeBoardMetrics } from '../engine/metrics';
import {
  PICKED,
  SCALE,
  STRIDE,
  VX,
  VY,
  X,
  Y,
  countPicked,
  pickTile,
  releaseTiles,
  stepWorld,
  tileAt,
} from '../engine/physics';
import { createBodies, scatterTiles } from '../engine/spawn';

/** مولد تصادفی قطعی، تا خطاها قابل تکرار باشند. */
const seeded = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const { world } = computeBoardMetrics(412, 915, 9);
const DT = 1 / 60;

const run = (bodies: number[], count: number, seconds: number, dt = DT) => {
  for (let t = 0; t < seconds; t += dt) {
    stepWorld(bodies, count, dt, world);
  }
};

describe('scatterTiles', () => {
  it('spreads tiles without overlaps when they fit', () => {
    const positions = scatterTiles(12, world.width, world.height, world.tileSize, seeded(1));
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const apart =
          Math.abs(positions[i].x - positions[j].x) >= world.tileSize - 1e-6 ||
          Math.abs(positions[i].y - positions[j].y) >= world.tileSize - 1e-6;
        expect(apart).toBe(true);
      }
    }
  });
});

describe('stepWorld', () => {
  const count = 9;

  it('keeps every tile inside the arena', () => {
    const bodies = createBodies(count, world, seeded(2));
    run(bodies, count, 20);
    for (let o = 0; o < count * STRIDE; o += STRIDE) {
      const half = (world.tileSize * bodies[o + SCALE]) / 2;
      expect(bodies[o + X]).toBeGreaterThanOrEqual(half - 1e-6);
      expect(bodies[o + X]).toBeLessThanOrEqual(world.width - half + 1e-6);
      expect(bodies[o + Y]).toBeGreaterThanOrEqual(half - 1e-6);
      expect(bodies[o + Y]).toBeLessThanOrEqual(world.height - half + 1e-6);
    }
  });

  it('eases speeds back into range quickly after collisions', () => {
    const bodies = createBodies(count, world, seeded(2));
    const slowFor = new Array<number>(count).fill(0);
    let longestSlow = 0;
    let fastest = 0;
    for (let frame = 0; frame < 60 * 30; frame++) {
      stepWorld(bodies, count, DT, world);
      for (let i = 0; i < count; i++) {
        const speed = Math.hypot(bodies[i * STRIDE + VX], bodies[i * STRIDE + VY]);
        slowFor[i] = speed < world.minSpeed * 0.8 ? slowFor[i] + DT : 0;
        longestSlow = Math.max(longestSlow, slowFor[i]);
        fastest = Math.max(fastest, speed);
      }
    }
    expect(longestSlow).toBeLessThan(0.75);
    expect(fastest).toBeLessThan(world.maxSpeed * 1.5);
  });

  it('shows every tile at full size from the first frame, then keeps them from overlapping', () => {
    const bodies = createBodies(count, world, seeded(3));
    for (let o = 0; o < count * STRIDE; o += STRIDE) {
      expect(bodies[o + SCALE]).toBe(1);
    }
    run(bodies, count, 2);
    let worstOverlap = 0;
    for (let frame = 0; frame < 600; frame++) {
      stepWorld(bodies, count, DT, world);
      for (let a = 0; a < count * STRIDE; a += STRIDE) {
        expect(bodies[a + SCALE]).toBeCloseTo(1, 2);
        for (let c = a + STRIDE; c < count * STRIDE; c += STRIDE) {
          const overlap = Math.min(
            world.tileSize - Math.abs(bodies[a + X] - bodies[c + X]),
            world.tileSize - Math.abs(bodies[a + Y] - bodies[c + Y]),
          );
          worstOverlap = Math.max(worstOverlap, overlap);
        }
      }
    }
    // در هر فریم رفع می‌شود: حداکثر به اندازه‌ی حرکت یک فریم ممکن است باقی بماند.
    expect(worstOverlap).toBeLessThan((world.maxSpeed * 2 * DT) + 1);
  });

  it('survives a huge frame without tunnelling out of the arena', () => {
    const bodies = createBodies(count, world, seeded(4));
    run(bodies, count, 1);
    stepWorld(bodies, count, 0.048, world);
    for (let o = 0; o < count * STRIDE; o += STRIDE) {
      expect(Number.isFinite(bodies[o + X]) && Number.isFinite(bodies[o + Y])).toBe(true);
    }
  });
});

describe('picking', () => {
  const count = 6;

  it('picks the tile under the finger, once', () => {
    const bodies = createBodies(count, world, seeded(5));
    run(bodies, count, 2);
    const index = tileAt(bodies, count, bodies[2 * STRIDE + X], bodies[2 * STRIDE + Y], world, 0);
    expect(index).toBe(2);
    pickTile(bodies, index);
    expect(tileAt(bodies, count, bodies[2 * STRIDE + X], bodies[2 * STRIDE + Y], world, 0)).not.toBe(2);
    expect(countPicked(bodies, count)).toBe(1);
  });

  it('ignores touches on empty space', () => {
    const bodies = createBodies(count, world, seeded(6));
    run(bodies, count, 2);
    expect(tileAt(bodies, count, -100, -100, world, 6)).toBe(-1);
  });

  it('shrinks picked tiles, then restores them on release', () => {
    const bodies = createBodies(count, world, seeded(7));
    run(bodies, count, 2);
    pickTile(bodies, 0);
    pickTile(bodies, 3);
    run(bodies, count, 1);
    expect(bodies[0 * STRIDE + SCALE]).toBeCloseTo(world.pickedScale, 2);
    expect(bodies[3 * STRIDE + SCALE]).toBeCloseTo(world.pickedScale, 2);

    expect(releaseTiles(bodies, count)).toBe(2);
    expect(bodies[0 * STRIDE + PICKED]).toBe(0);
    run(bodies, count, 1);
    expect(bodies[0 * STRIDE + SCALE]).toBeCloseTo(1, 2);
    expect(bodies[3 * STRIDE + SCALE]).toBeCloseTo(1, 2);
  });
});
