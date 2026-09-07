import {
  Bell,
  BellSlash,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
  Sun,
  Leaf,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';

interface ToggleProps {
  on: boolean;
  disabled?: boolean;
  label: string;
  hint?: string;
  OnIcon: ComponentType<{ size?: number; weight?: 'regular' }>;
  OffIcon: ComponentType<{ size?: number; weight?: 'regular' }>;
  onClick: () => void;
}

function Toggle({ on, disabled, label, hint, OnIcon, OffIcon, onClick }: ToggleProps) {
  const Icon = on ? OnIcon : OffIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      title={hint ?? label}
      className={[
        'inline-flex items-center gap-2 rounded-control border px-3 py-2',
        'text-[13px] transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        on
          ? 'border-ember/40 bg-ember/10 text-ember'
          : 'border-zinc-700 bg-zinc-950/85 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100',
      ].join(' ')}
    >
      <Icon size={16} weight="regular" />
      {/* Label is always in the a11y tree, and becomes visible from sm up. */}
      <span className="sr-only sm:not-sr-only">{label}</span>
    </button>
  );
}

interface Props {
  notify: boolean;
  notifyDenied: boolean;
  sound: boolean;
  awake: boolean;
  calm: boolean;
  wakeLockSupported: boolean;
  onNotify: () => void;
  onSound: () => void;
  onAwake: () => void;
  onCalm: () => void;
}

export function Controls(p: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Toggle on={p.calm} label="Calm" hint="Pause character animation"
        OnIcon={Leaf} OffIcon={Leaf} onClick={p.onCalm} />
      <Toggle
        on={p.notify}
        disabled={p.notifyDenied}
        label="Notify"
        hint={
          p.notifyDenied
            ? 'Notifications are blocked for this site in your browser settings'
            : 'Notify me when the phase changes'
        }
        OnIcon={Bell}
        OffIcon={BellSlash}
        onClick={p.onNotify}
      />
      <Toggle
        on={p.sound}
        label="Sound"
        hint="Play a chime when the phase changes"
        OnIcon={SpeakerSimpleHigh}
        OffIcon={SpeakerSimpleSlash}
        onClick={p.onSound}
      />
      {p.wakeLockSupported ? (
        <Toggle
          on={p.awake}
          label="Keep awake"
          hint="Stop the screen sleeping while the room is on display"
          OnIcon={Sun}
          OffIcon={Sun}
          onClick={p.onAwake}
        />
      ) : null}
    </div>
  );
}
