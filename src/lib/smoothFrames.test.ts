import { expect, it } from 'vitest';
import { atlasFrame, ATLAS_OFFSETS, ATLAS_ROWS, breakFrame } from './breakMotion';
import { spriteFrame } from './spriteFrame';
import { headphoneFrame, floorActivity, BACK_STRETCH_START } from './characterActivities';
import { FOCUS_MS } from './cycle';
it('packs every seated frame into a unique atlas cell', () => {
  const cells = Object.keys(ATLAS_OFFSETS).flatMap(sheet => [0, 1, 2, 3].map(frame => atlasFrame(sheet as keyof typeof ATLAS_OFFSETS, frame)));
  expect(new Set(cells).size).toBe(28);
  expect(Math.max(...cells)).toBeLessThan(ATLAS_ROWS * 4);
});
it('closes and opens the eyelids through intermediate frames', () => {
  const times = [4000, 4070, 4200, 4300, 4400];
  expect(times.map(t => spriteFrame(t, 'focus'))).toEqual([0, 4, 1, 4, 0]);
  expect(times.map(t => headphoneFrame(t, false, true)?.frame)).toEqual([0, 4, 1, 4, 0]);
});
it('lowers arms through the same intermediate poses in reverse', () => {
  const cell = (t: number) => { const p = breakFrame(FOCUS_MS + t, 'stretching'); return atlasFrame(p.sheet, p.frame); };
  const up = Array.from({length: 6}, (_, i) => cell(600 + i * 100));
  const down = Array.from({length: 6}, (_, i) => cell(5800 + i * 100));
  expect(down).toEqual(up.reverse());
});
it('uses all four back-stretch frames without moving the actor', () => {
  const frames = new Set<number>();
  for (let t = 0; t < 6000; t += 100) {
    const pose = floorActivity(FOCUS_MS + BACK_STRETCH_START + t)!;
    frames.add(pose.frame);
    expect([pose.x, pose.top]).toEqual([61, 14]);
  }
  expect(frames.size).toBe(4);
});
