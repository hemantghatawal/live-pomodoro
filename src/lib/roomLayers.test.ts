import { describe, expect, it } from 'vitest';
import { SLOTS } from './assets';
import { chooseLayers, preferredVariants, type RoomState } from './roomLayers';

const BASE: RoomState = {
  phase: 'focus',
  pose: 'typing',
  activity: 'at-window',
  cycleIndex: 0,
  daylight: 1,
  screen: 'a',
};

const only =
  (...ids: string[]) =>
  (id: string) =>
    ids.includes(id);

const ids = (slots: { id: string }[]) => slots.map((s) => s.id);

describe('an empty asset set', () => {
  it('renders nothing rather than throwing', () => {
    expect(chooseLayers(SLOTS, () => false, BASE)).toEqual([]);
  });
});

describe('a minimal asset set', () => {
  it('renders just the room when only the room exists', () => {
    expect(ids(chooseLayers(SLOTS, only('room-base'), BASE))).toEqual(['room-base']);
  });

  it('puts the character above the room', () => {
    const out = ids(chooseLayers(SLOTS, only('room-base', 'pose-typing'), BASE));
    expect(out).toEqual(['room-base', 'pose-typing']);
  });

  it('falls back to the one pose that exists during a break', () => {
    // The whole point: a single character image covers all eight poses.
    const state: RoomState = { ...BASE, phase: 'break', activity: 'on-bed' };
    const out = ids(chooseLayers(SLOTS, only('room-base', 'pose-typing'), state));
    expect(out).toContain('pose-typing');
  });
});

describe('variant selection', () => {
  it('prefers the exact pose when it exists', () => {
    const state: RoomState = { ...BASE, phase: 'break', activity: 'on-bed' };
    const out = ids(chooseLayers(SLOTS, only('pose-typing', 'pose-on-bed'), state));
    expect(out).toEqual(['pose-on-bed']);
  });

  it('never shows two poses at once', () => {
    const has = (id: string) => id.startsWith('pose-');
    const out = chooseLayers(SLOTS, has, BASE).filter((s) => s.variantOf === 'pose');
    expect(out).toHaveLength(1);
  });

  it('never shows two window views at once', () => {
    const out = chooseLayers(SLOTS, () => true, BASE).filter((s) => s.variantOf === 'view');
    expect(out).toHaveLength(1);
  });

  it('switches the window to night as the light drops', () => {
    expect(preferredVariants({ ...BASE, daylight: 1 }).view).toBe('view-day');
    expect(preferredVariants({ ...BASE, daylight: 0.05 }).view).toBe('view-night');
  });

  it('puts the cat on the desk at night', () => {
    expect(preferredVariants({ ...BASE, daylight: 0.05 }).cat).toBe('cat-asleep-on-desk');
    expect(preferredVariants({ ...BASE, daylight: 1 }).cat).toBe('cat-sitting');
  });

  it('maps the resolved screen frame onto its slot', () => {
    const seen = new Set(
      (['a', 'b', 'c'] as const).map((f) => preferredVariants({ ...BASE, screen: f }).screen),
    );
    expect(seen).toEqual(new Set(['screen-a', 'screen-b', 'screen-c']));
  });
});

describe('paint order', () => {
  it('is strictly ascending with a full asset set', () => {
    const out = chooseLayers(SLOTS, () => true, BASE);
    const zs = out.map((s) => s.z);
    expect([...zs].sort((a, b) => a - b)).toEqual(zs);
  });

  it('keeps the view behind the room and light in front of both', () => {
    const out = ids(chooseLayers(SLOTS, () => true, BASE));
    expect(out.indexOf('view-day')).toBeLessThan(out.indexOf('room-base'));
    expect(out.indexOf('room-base')).toBeLessThan(out.indexOf('light-shaft'));
  });
});

describe('manifest integrity', () => {
  it('has no duplicate slot ids', () => {
    expect(new Set(SLOTS.map((s) => s.id)).size).toBe(SLOTS.length);
  });

  it('gives every variant group at least two members', () => {
    const groups = new Map<string, number>();
    for (const s of SLOTS) {
      if (s.variantOf) groups.set(s.variantOf, (groups.get(s.variantOf) ?? 0) + 1);
    }
    for (const [, count] of groups) expect(count).toBeGreaterThanOrEqual(2);
  });
});
