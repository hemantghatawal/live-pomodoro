import {
  Bell,
  BellSlash,
  SpeakerSimpleHigh,
  SpeakerSimpleSlash,
  Sun,
  Leaf,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';
import type { NotifyState } from '../../lib/notify';

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
      aria-description={hint}
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
  notifyPermission: NotifyState;
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
      <Toggle on={p.calm} label="Calm" hint="Pause character movement and hide thought bubbles. The timer keeps running."
        OnIcon={Leaf} OffIcon={Leaf} onClick={p.onCalm} />
      <Toggle
        on={p.notify}
        disabled={p.notifyPermission === 'denied' || p.notifyPermission === 'unsupported'}
        label="Notify"
        hint={
          p.notifyPermission === 'unsupported'
            ? 'This browser does not support desktop notifications. Try opening the room in a supported browser.'
            : p.notifyPermission === 'denied'
              ? 'Notifications are blocked for this site. Allow them in your browser settings to enable alerts.'
              : 'Show a desktop notification when focus or break starts. Requires browser permission and an open page.'
        }
        OnIcon={Bell}
        OffIcon={BellSlash}
        onClick={p.onNotify}
      />
      <Toggle
        on={p.sound}
        label="Sound"
        hint="Play a short chime when focus or break starts. Plays a sample when turned on."
        OnIcon={SpeakerSimpleHigh}
        OffIcon={SpeakerSimpleSlash}
        onClick={p.onSound}
      />
      {p.wakeLockSupported ? (
        <Toggle
          on={p.awake}
          label="Keep awake"
          hint="Ask the browser to keep your screen awake while this page is visible. Battery-saving settings may override this."
          OnIcon={Sun}
          OffIcon={Sun}
          onClick={p.onAwake}
        />
      ) : null}
    </div>
  );
}
