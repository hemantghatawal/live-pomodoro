import { Bell, BellSlash, SpeakerSimpleHigh, SpeakerSimpleSlash, Sun, Leaf, GearSix, X } from '@phosphor-icons/react';
import { useEffect, useId, useRef, useState, type ComponentType } from 'react';
import type { NotifyState } from '../../lib/notify';

interface ToggleProps {
  on: boolean;
  disabled?: boolean;
  label: string;
  hint: string;
  OnIcon: ComponentType<{ size?: number; weight?: 'regular' }>;
  OffIcon: ComponentType<{ size?: number; weight?: 'regular' }>;
  onClick: () => void;
}

function Toggle({ on, disabled, label, hint, OnIcon, OffIcon, onClick }: ToggleProps) {
  const Icon = on ? OnIcon : OffIcon;
  const description = useId();
  return (
    <div className="py-3">
      <button type="button" role="switch" aria-checked={on} aria-label={label}
        aria-describedby={description} disabled={disabled} onClick={onClick}
        className="flex min-h-9 w-full items-center gap-3 rounded-md text-left text-sm text-zinc-100 disabled:cursor-not-allowed disabled:opacity-45">
        <Icon size={18} />
        <span className="flex-1">{label}</span>
        <span className={`rounded-full px-2.5 py-1 text-xs ${on && !disabled ? 'bg-ember/15 text-ember' : 'bg-zinc-800 text-zinc-400'}`}>
          {disabled ? 'Unavailable' : on ? 'On' : 'Off'}
        </span>
      </button>
      <p id={description} className="mt-1 pl-[30px] text-xs leading-relaxed text-zinc-400">{hint}</p>
    </div>
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
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const id = useId();
  const close = () => { setOpen(false); trigger.current?.focus(); };

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div ref={root} className="relative z-40" onBlur={(event) => {
      if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={trigger} type="button" aria-expanded={open} aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-10 items-center gap-2 rounded-control border border-zinc-700 bg-zinc-950/85 px-4 py-2 text-[13px] text-zinc-200 hover:border-zinc-500">
        <GearSix size={17} /> Settings
      </button>
      {open ? (
        <section ref={panel} id={id} aria-label="Room settings"
          className="absolute right-0 top-full mt-3 max-h-[calc(100dvh-110px)] w-[min(21rem,calc(100vw-3rem))] overflow-y-auto rounded-panel border border-zinc-700 bg-zinc-950/95 px-5 py-3 shadow-2xl backdrop-blur-md">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-100">Room settings</h2>
            <button type="button" aria-label="Close settings" onClick={close}
              className="-mr-2 rounded-full p-2 text-zinc-400 hover:text-zinc-100"><X size={18} /></button>
          </div>
          <Toggle on={p.calm} label="Calm" hint="Pause movement and hide thought bubbles. The timer keeps running."
            OnIcon={Leaf} OffIcon={Leaf} onClick={p.onCalm} />
          <Toggle on={p.notify} label="Notify" disabled={p.notifyPermission === 'denied' || p.notifyPermission === 'unsupported'}
            hint={p.notifyPermission === 'unsupported' ? 'Desktop notifications are not supported in this browser.'
              : p.notifyPermission === 'denied' ? 'Allow notifications for this site in your browser settings.'
              : 'Get focus and break alerts while the page is open. Requires browser permission.'}
            OnIcon={Bell} OffIcon={BellSlash} onClick={p.onNotify} />
          <Toggle on={p.sound} label="Sound" hint="A short chime when focus or break starts. Turning this on plays a sample."
            OnIcon={SpeakerSimpleHigh} OffIcon={SpeakerSimpleSlash} onClick={p.onSound} />
          <Toggle on={p.awake} label="Keep awake" disabled={!p.wakeLockSupported}
            hint={p.wakeLockSupported ? 'Keep the screen awake while this page is visible. Battery-saving settings may override this.'
              : 'Keeping the screen awake is not supported in this browser.'}
            OnIcon={Sun} OffIcon={Sun} onClick={p.onAwake} />
          <p className="pb-2 pt-1 text-xs text-zinc-500">Your choices are saved in this browser.</p>
        </section>
      ) : null}
    </div>
  );
}
