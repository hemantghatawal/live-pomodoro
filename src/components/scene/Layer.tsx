import type { Blend } from '../../lib/assets';

interface Props {
  src: string;
  alt?: string;
  z: number;
  blend?: Blend;
  opacity?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * One image in the room stack. Every layer shares the same source dimensions
 * and the same object-fit, which is what keeps them aligned without any
 * per-layer positioning.
 */
export function Layer({ src, alt = '', z, blend = 'normal', opacity, className, style }: Props) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt === ''}
      draggable={false}
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${className ?? ''}`}
      style={{
        zIndex: z,
        mixBlendMode: blend === 'normal' ? undefined : blend,
        opacity,
        ...style,
      }}
    />
  );
}
