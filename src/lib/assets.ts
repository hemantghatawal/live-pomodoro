/**
 * The room's layer manifest.
 *
 * Every layer the room can ever have is declared here, whether or not the
 * image exists yet. Files are discovered at build time, so a slot with no file
 * simply does not render and everything else carries on. Drop one image in
 * today and ten more next month; nothing in the code changes.
 *
 * To add art: put the file in `src/assets/room/` named exactly after its slot
 * id, in any of png, webp, avif, jpg or svg. That is the whole process.
 */

export type SlotCategory = 'view' | 'room' | 'prop' | 'screen' | 'cat' | 'character' | 'light' | 'presence';

/** How a layer composites. Light layers add rather than cover. */
export type Blend = 'normal' | 'screen' | 'multiply';

export interface Slot {
  id: string;
  label: string;
  category: SlotCategory;
  /** Paint order, low first. Leaves gaps so layers can be inserted later. */
  z: number;
  blend?: Blend;
  /** Slots that are alternatives to each other, only one shows at a time. */
  variantOf?: string;
  /** A sheet is consumed by its sprite player, never drawn as a full-room layer. */
  spriteSheet?: boolean;
}

export const SLOTS: readonly Slot[] = [
  // Behind the window
  { id: 'view-day', label: 'Window view, day', category: 'view', z: 10, variantOf: 'view' },
  { id: 'view-night', label: 'Window view, night', category: 'view', z: 10, variantOf: 'view' },
  { id: 'city-windows-lit', label: 'City windows lit', category: 'presence', z: 12, blend: 'screen' },
  { id: 'power-line', label: 'Power line', category: 'presence', z: 14 },

  // The room itself
  { id: 'room-base', label: 'Room', category: 'room', z: 20 },
  { id: 'curtain', label: 'Curtain', category: 'prop', z: 25 },
  { id: 'plant', label: 'Plant', category: 'prop', z: 30 },

  // Desk
  { id: 'screen-a', label: 'Monitors A', category: 'screen', z: 35, variantOf: 'screen' },
  { id: 'screen-b', label: 'Monitors B', category: 'screen', z: 35, variantOf: 'screen' },
  { id: 'screen-c', label: 'Monitors C', category: 'screen', z: 35, variantOf: 'screen' },
  { id: 'monitor-glow', label: 'Monitor glow', category: 'light', z: 37, blend: 'screen' },

  { id: 'timer-body', label: 'Desk timer body', category: 'prop', z: 40 },
  { id: 'timer-dial', label: 'Desk timer dial', category: 'prop', z: 41 },
  { id: 'timer-glow', label: 'Desk timer glow', category: 'light', z: 42, blend: 'screen' },

  { id: 'clock-face', label: 'Wall clock face', category: 'prop', z: 45 },
  { id: 'clock-hand-hour', label: 'Clock hand, hour', category: 'prop', z: 46 },
  { id: 'clock-hand-minute', label: 'Clock hand, minute', category: 'prop', z: 47 },
  { id: 'clock-hand-second', label: 'Clock hand, second', category: 'prop', z: 48 },

  { id: 'mug', label: 'Mug', category: 'prop', z: 50 },
  { id: 'steam', label: 'Steam', category: 'prop', z: 51 },
  { id: 'phone', label: 'Phone', category: 'prop', z: 52, variantOf: 'phone' },
  { id: 'phone-lit', label: 'Phone lit', category: 'prop', z: 53, variantOf: 'phone' },
  { id: 'desk-toy', label: 'Desk toy', category: 'prop', z: 54 },
  { id: 'car', label: 'Car headlights', category: 'prop', z: 15 },

  // Living things
  { id: 'developer-sprites', label: 'Developer, four frames', category: 'character', z: 70, spriteSheet: true },
  { id: 'developer-break-sprites', label: 'Developer break movements', category: 'character', z: 70, spriteSheet: true },
  { id: 'cat-sitting', label: 'Cat sitting', category: 'cat', z: 60, variantOf: 'cat' },
  { id: 'cat-walking', label: 'Cat walking', category: 'cat', z: 60, variantOf: 'cat' },
  { id: 'cat-asleep-on-desk', label: 'Cat asleep', category: 'cat', z: 60, variantOf: 'cat' },
  { id: 'cat-ears-b', label: 'Cat ear twitch', category: 'cat', z: 61 },

  { id: 'pose-typing', label: 'Typing', category: 'character', z: 70, variantOf: 'pose' },
  { id: 'pose-thinking', label: 'Thinking', category: 'character', z: 70, variantOf: 'pose' },
  { id: 'pose-head-desk', label: 'Head on desk', category: 'character', z: 70, variantOf: 'pose' },
  { id: 'pose-at-window', label: 'At the window', category: 'character', z: 70, variantOf: 'pose' },
  { id: 'pose-with-cat', label: 'With the cat', category: 'character', z: 70, variantOf: 'pose' },
  { id: 'pose-on-bed', label: 'On the bed', category: 'character', z: 70, variantOf: 'pose' },
  { id: 'pose-stretching', label: 'Stretching', category: 'character', z: 70, variantOf: 'pose' },
  { id: 'pose-coffee', label: 'Coffee', category: 'character', z: 70, variantOf: 'pose' },
  { id: 'typing-hands-b', label: 'Typing hands, frame B', category: 'character', z: 71 },
  { id: 'blink-overlay', label: 'Blink', category: 'character', z: 72 },

  // Air and light, over everything
  { id: 'fan-blades', label: 'Ceiling fan', category: 'prop', z: 80 },
  { id: 'lamp-glow', label: 'Lamp glow', category: 'light', z: 85, blend: 'screen' },
  { id: 'light-shaft', label: 'Light shaft', category: 'light', z: 90, blend: 'screen' },
  { id: 'grain', label: 'Grain', category: 'light', z: 95, blend: 'screen' },
];

/**
 * Discovered at build time. Vite rewrites these to hashed, cacheable URLs, so
 * adding a file to the folder is genuinely all that is required.
 */
const FILES = import.meta.glob('../assets/room/*.{png,webp,avif,jpg,jpeg,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** Preferred when the same slot has several files. Best format wins. */
const EXT_RANK: Record<string, number> = { avif: 0, webp: 1, png: 2, jpg: 3, jpeg: 3, svg: 4 };

const BY_ID: Record<string, string> = {};
const RANK: Record<string, number> = {};

for (const [path, url] of Object.entries(FILES)) {
  const base = path.split('/').pop() ?? '';
  const dot = base.lastIndexOf('.');
  const id = base.slice(0, dot);
  const ext = base.slice(dot + 1).toLowerCase();
  const rank = EXT_RANK[ext] ?? 99;

  const existing = RANK[id];
  if (existing !== undefined) {
    if (import.meta.env.DEV) {
      // Silent ambiguity here would be maddening to debug later.
      console.warn(
        `[assets] "${id}" has more than one file. Using the ${rank < existing ? ext : 'existing'} one. Delete the duplicate.`,
      );
    }
    if (rank >= existing) continue;
  }

  BY_ID[id] = url;
  RANK[id] = rank;
}

export function assetUrl(id: string): string | null {
  return BY_ID[id] ?? null;
}

export function hasAsset(id: string): boolean {
  return id in BY_ID;
}

/** Slots sorted into paint order, whether or not their file exists. */
export const SLOTS_BY_Z: readonly Slot[] = [...SLOTS].sort((a, b) => a.z - b.z);

export interface SlotStatus {
  slot: Slot;
  present: boolean;
}

export function slotStatus(): SlotStatus[] {
  return SLOTS_BY_Z.map((slot) => ({ slot, present: hasAsset(slot.id) }));
}

/** True once there is enough art to show a room at all. */
export function hasRoom(): boolean {
  return hasAsset('room-base');
}
