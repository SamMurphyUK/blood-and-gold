// tslint:disable
/* eslint-disable */
import React, {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react';

/**  --- Overlay component ---
 * A full-screen UI overlay component used to display game states
 * such as Start Menus, Pause Screens, Game Over, and Victory screens.
 * It renders a semi-transparent background with a title, optional description,
 * and a primary action button.
 */

type OverlayTone = 'neutral' | 'danger' | 'victory';

interface OverlayProps {
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
  tone?: OverlayTone;
  autoFocus?: boolean;
}

const TONE_CLASS: Record<OverlayTone, string> = {
  neutral: 'bg-black/70',
  danger: 'bg-red-900/80',
  victory: 'bg-emerald-900/80',
};

const BUTTON_CLASS: Record<OverlayTone, string> = {
  neutral: 'hover:bg-yellow-400',
  danger: 'hover:bg-red-400',
  victory: 'hover:bg-emerald-400',
};

/**
 * @param title - The main, large heading text to display (e.g., "GAME OVER").
 * @param description - Optional subtitle text to display below the title (e.g., "Final Score: 42").
 * @param actionLabel - The text to display inside the primary action button (e.g., "PLAY AGAIN").
 * @param onAction - Callback function executed when the user clicks the primary action button.
 * @param icon - Optional React node (like a Lucide icon) rendered inside the action button next to the label.
 * @param tone - The visual theme of the overlay which dictates background and hover colors. Defaults to 'neutral'. ('neutral' | 'danger' | 'victory')
 */
/** Focuses the referenced element on mount to ensure Enter works. */
export function useAutoFocus<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    // Only focus if enabled is true
    if (enabled && ref.current) {
      ref.current.focus();
    }
  }, [enabled]);
  return ref;
}

export function Overlay({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  tone = 'neutral',
  autoFocus = true,
}: OverlayProps) {
  const buttonRef = useAutoFocus<HTMLButtonElement>(autoFocus);

  return (
    <div
      className={`absolute inset-0 ${TONE_CLASS[tone]} overflow-y-auto touch-auto z-50 flex items-center justify-center p-4`}>
      <div className="relative w-full max-w-md bg-[#2A1B19] border-4 border-[#8C7A6B] rounded-xl p-6 md:p-8 shadow-[0_12px_0_#1D1312,inset_0_2px_0_#ded095] flex flex-col items-center">
        {/* Pixel Corner Rivets */}
        <span className="absolute top-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
        <span className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />
        <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-[#ded095] border border-black" />

        <h1 className="text-2xl md:text-4xl font-black mb-3 text-[#ded095] text-center tracking-wider font-serif">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-[#a4968d] mb-6 text-center leading-relaxed">
            {description}
          </p>
        )}
        <button
          ref={buttonRef}
          autoFocus={autoFocus}
          onClick={onAction}
          data-testid="start-button"
          className="bg-[#ba7654] hover:bg-[#cb9f6b] text-[#3f363b] px-6 md:px-8 py-2.5 md:py-3 rounded-full font-black text-sm md:text-base transition-colors flex items-center gap-2 shadow-lg cursor-pointer">
          {icon}
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export interface MenuOverlayProps {
  children: React.ReactNode;
  tone?: OverlayTone;
  zIndex?: number;
  onBackdropClick?: () => void;
}

/**
 * A highly resilient menu wrapper that statically decouples scrolling from flexbox alignment.
 * It strictly avoids the clipping bug on mobile by preventing flex justify-center from being assigned
 * to the overflow-y-auto boundary. Plugs seamlessly into the AI's generation workflows.
 * The inner children should provide their own box styling (e.g., w-full max-w-md bg-slate-900 rounded).
 */
export function MenuOverlay({
  children,
  tone = 'neutral',
  zIndex = 40,
  onBackdropClick,
}: MenuOverlayProps) {
  return (
    <div
      className={`absolute inset-0 ${TONE_CLASS[tone]} overflow-y-auto touch-auto`}
      style={{zIndex}}
      onClick={(e) => {
        if (onBackdropClick) {
          onBackdropClick();
        }
      }}>
      <div className="min-h-full flex flex-col items-center p-4">
        <div
          className="m-auto flex flex-col items-center w-full justify-center"
          onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Actions that can be triggered by the user. */
export type InputAction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'confirm'
  | 'cancel'
  | 'tap';

/** Represents the state of the pointer (mouse or touch). */
export interface PointerState {
  /** The X coordinate of the pointer. */
  x: number;
  /** The Y coordinate of the pointer. */
  y: number;
  /** Whether the pointer is currently pressed down. */
  down: boolean;
}

/** A snapshot of the input state at a specific frame. */
export interface InputSnapshot {
  /** Map of actions to their active state. */
  actions: Record<InputAction, boolean>;
  /** The current state of the pointer. */
  pointer: PointerState;
}

interface LogicalSize {
  width: number;
  height: number;
}

const ACTION_KEYS: Record<string, InputAction> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  a: 'left',
  d: 'right',
  w: 'up',
  s: 'down',
  Enter: 'confirm',
  ' ': 'confirm',
  Escape: 'cancel',
};

/**
 * Initializes all input actions to a default 'false' state.
 */
const createEmptyActions = (): Record<InputAction, boolean> => ({
  left: false,
  right: false,
  up: false,
  down: false,
  confirm: false,
  cancel: false,
  tap: false,
});

/**
 * Calculates the pointer's logical X/Y coordinates on the canvas.
 */
const getPointerPosition = (
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  logicalSize?: LogicalSize,
): {x: number; y: number} => {
  const rect = canvas.getBoundingClientRect();
  const width = logicalSize?.width ?? rect.width;
  const height = logicalSize?.height ?? rect.height;
  const x = (event.clientX - rect.left) * (width / rect.width);
  const y = (event.clientY - rect.top) * (height / rect.height);
  return {x, y};
};

/**
 * Hook to capture and manage user input (keyboard and pointer).
 * @param canvasRef Reference to the game canvas element.
 * @param enabled Whether input capture is enabled.
 * @param logicalSize Optional logical size of the canvas for coordinate scaling.
 * @returns A mutable ref containing the current input snapshot.
 */
export const useInput = (
  canvasRef: RefObject<HTMLCanvasElement>,
  enabled = true,
  logicalSize?: LogicalSize,
): MutableRefObject<InputSnapshot> => {
  const inputRef = useRef<InputSnapshot>({
    actions: createEmptyActions(),
    pointer: {x: 0, y: 0, down: false},
  });

  useEffect(() => {
    if (!enabled) {
      inputRef.current.actions = createEmptyActions();
      inputRef.current.pointer = {x: 0, y: 0, down: false};
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const action = ACTION_KEYS[event.key];
      if (!action) return;
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(
          event.key,
        )
      ) {
        event.preventDefault();
      }
      inputRef.current.actions[action] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const action = ACTION_KEYS[event.key];
      if (!action) return;
      inputRef.current.actions[action] = false;
    };

    const canvas = canvasRef.current;
    const handlePointerDown = (event: PointerEvent) => {
      if (!canvas) return;
      if (typeof canvas.setPointerCapture === 'function') {
        canvas.setPointerCapture(event.pointerId);
      }
      inputRef.current.pointer = {
        ...getPointerPosition(event, canvas, logicalSize),
        down: true,
      };
      inputRef.current.actions.tap = true;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!canvas) return;
      inputRef.current.pointer = {
        ...getPointerPosition(event, canvas, logicalSize),
        down: inputRef.current.pointer.down,
      };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!canvas) return;
      if (
        typeof canvas.releasePointerCapture === 'function' &&
        canvas.hasPointerCapture(event.pointerId)
      ) {
        canvas.releasePointerCapture(event.pointerId);
      }
      inputRef.current.pointer = {
        ...getPointerPosition(event, canvas, logicalSize),
        down: false,
      };
      inputRef.current.actions.tap = false;
    };

    const handleBlur = () => {
      inputRef.current.actions = createEmptyActions();
      if (inputRef.current.pointer) {
        inputRef.current.pointer.down = false;
      }
      inputRef.current.actions.tap = false;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleBlur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (canvas) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerup', handlePointerUp);
      canvas.addEventListener('pointercancel', handlePointerUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (canvas) {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerup', handlePointerUp);
        canvas.removeEventListener('pointercancel', handlePointerUp);
      }
    };
  }, [canvasRef, enabled]);

  return inputRef;
};

/**
 * audio.ts — procedural sound effects via the Web Audio API.
 *
 * No asset files, no network: every sound is synthesized on the fly. Import the
 * shared `gameAudio` singleton, insert required SFX methods, and call them:
 *
 *   import { gameAudio } from './utils/helper';
 *
 *   // After inserting playArcadeLaser:
 *   gameAudio.playArcadeLaser();         // on shoot
 *
 * Autoplay: browsers block audio until the first user gesture. This module
 * unlocks itself on the first pointer/key/touch event, and every play call also
 * resumes the context — so it is safe to call any method at any time; calls made
 * before the first interaction simply no-op instead of throwing.
 *
 * Volume & mute are global (master): gameAudio.setVolume(0.4),
 * gameAudio.toggleMute().
 */

interface Beat {
  ctx: AudioContext;
  out: GainNode;
  now: number;
}

class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxMaster: GainNode | null = null;
  private muted = false; // SFX muted
  private volume = 0.6; // master volume, 0..1

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('playground-mute', (e: Event) => {
        const customEvent = e as CustomEvent<{muted: boolean}>;
        this.setMuted(customEvent.detail.muted);
      });
    }
  }

  // --- Context lifecycle -----------------------------------------------------

  /**
   * Lazily create the AudioContext + master gain on first use. Returns null when
   * Web Audio is unavailable (e.g. during SSR), in which case all play calls
   * become no-ops.
   */
  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    if (typeof window === 'undefined') return null;

    const Ctor =
      window.AudioContext ||
      (window as unknown as {webkitAudioContext?: typeof AudioContext})
        .webkitAudioContext;
    if (!Ctor) {
      console.warn('[audio] Web Audio API not supported');
      return null;
    }

    try {
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.sfxMaster = this.ctx.createGain();
      this.master.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.sfxMaster.gain.setValueAtTime(
        this.muted ? 0 : 1,
        this.ctx.currentTime,
      );
      this.sfxMaster.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.attachUnlock();
      return this.ctx;
    } catch (err) {
      console.warn('[audio] Web Audio AudioContext initialization failed or blocked:', err);
      return null;
    }
  }

  /** Resume the context on the first user gesture (one-shot). */
  private attachUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      void this.ctx?.resume().catch(() => {});
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    window.addEventListener('touchstart', unlock);
  }

  /** Manually resume the context — call from a click handler if needed. */
  resume() {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => {});
  }

  /** Prepare to play a one-shot. Returns null when muted or unavailable. */
  private begin(): Beat | null {
    const ctx = this.ensure();
    const out = this.sfxMaster;
    if (!ctx || !out || this.muted) return null;
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    return {ctx, out, now: ctx.currentTime};
  }

  // --- Master controls -------------------------------------------------------

  /** Set master volume (0..1). Affects SFX. */
  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master && this.ctx && !this.muted) {
      this.master.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  /** Toggle global SFX mute. Returns the new muted state. */
  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.sfxMaster && this.ctx) {
      this.sfxMaster.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  getMuteState(): boolean {
    return this.muted;
  }

  /** Expose underlying AudioContext for procedural music and synth modules */
  getContext(): AudioContext | null {
    return this.ensure();
  }

  /** Expose master GainNode for volume & mute routing */
  getMasterGain(): GainNode | null {
    this.ensure();
    return this.master;
  }

  // --- Synthesis helpers -----------------------------------------------------

  /** Schedule one enveloped oscillator. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private blip(
    b: Beat,
    at: number,
    o: {
      freq: number;
      freqTo?: number;
      dur: number;
      type?: OscillatorType;
      gain?: number;
      glide?: 'exp' | 'lin';
    },
  ) {
    const {ctx, out} = b;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = o.type ?? 'square';
    osc.frequency.setValueAtTime(o.freq, at);
    if (o.freqTo !== undefined) {
      if ((o.glide ?? 'exp') === 'lin') {
        osc.frequency.linearRampToValueAtTime(o.freqTo, at + o.dur);
      } else {
        // Exponential ramps cannot target 0.
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(1, o.freqTo),
          at + o.dur,
        );
      }
    }

    const peak = o.gain ?? 0.15;
    g.gain.setValueAtTime(peak, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + o.dur);

    osc.connect(g);
    g.connect(out);
    osc.start(at);
    osc.stop(at + o.dur + 0.02);
  }

  /** Schedule a filtered white-noise burst (impacts, explosions). */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private noiseBurst(
    b: Beat,
    at: number,
    o: {dur: number; gain?: number; from?: number; to?: number},
  ) {
    const {ctx, out} = b;
    const len = Math.max(1, Math.floor(ctx.sampleRate * o.dur));
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(o.from ?? 1000, at);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(1, o.to ?? 80),
      at + o.dur,
    );

    const g = ctx.createGain();
    g.gain.setValueAtTime(o.gain ?? 0.18, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + o.dur);

    src.connect(filter);
    filter.connect(g);
    g.connect(out);
    src.start(at);
    src.stop(at + o.dur);
  }

  /** Small random multiplier so rapid-fire sounds don't feel robotic. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private vary(amount = 0.05): number {
    return 1 + (Math.random() * 2 - 1) * amount;
  }

  // --- Sound effects ---------------------------------------------------------

  /** Generic one-shot tone — escape hatch for custom blips. */
  playTone(o: {
    type?: OscillatorType;
    freq: number;
    freqTo?: number;
    dur?: number;
    gain?: number;
  }) {
    const b = this.begin();
    if (!b) return;
    this.blip(b, b.now, {
      type: o.type,
      freq: o.freq,
      freqTo: o.freqTo,
      dur: o.dur ?? 0.15,
      gain: o.gain,
    });
  }

  playTallyBlip(freq = 440) {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.01);
    this.blip(b, b.now, {
      type: 'sine',
      freq: freq * v,
      dur: 0.045,
      gain: 0.08,
    });
  }

  // INSERT_SFX_HERE
  playPotionGulp() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 320 * v, freqTo: 140 * v, dur: 0.15, gain: 0.1 });
    this.blip(b, b.now + 0.12, { type: 'sine', freq: 280 * v, freqTo: 120 * v, dur: 0.18, gain: 0.08 });
  }

  playGhostSparkle() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.01);
    this.blip(b, b.now, { type: 'sine', freq: 1760 * v, freqTo: 2640 * v, dur: 0.18, gain: 0.08 });
    this.blip(b, b.now + 0.05, { type: 'sine', freq: 3520 * v, dur: 0.22, gain: 0.05 });
    this.noiseBurst(b, b.now, { dur: 0.1, gain: 0.02, from: 4000, to: 8000 });
  }

  playMadnessSFX() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.01);
    // Jarring dissonant tritone drone (A2 110Hz and Eb3 155.56Hz) + eerie detuned saw
    this.blip(b, b.now, { type: 'sawtooth', freq: 110 * v, freqTo: 104 * v, dur: 1.8, gain: 0.22 });
    this.blip(b, b.now, { type: 'sawtooth', freq: 155.56 * v, freqTo: 164 * v, dur: 1.8, gain: 0.2 });
    this.blip(b, b.now + 0.05, { type: 'triangle', freq: 55 * v, freqTo: 48 * v, dur: 2.0, gain: 0.25 });
    this.blip(b, b.now + 0.1, { type: 'sine', freq: 830 * v, freqTo: 740 * v, dur: 1.2, gain: 0.08 });
    // Whispering eerie noise sweep
    this.noiseBurst(b, b.now + 0.1, { dur: 1.6, gain: 0.15, from: 1800 * v, to: 280 });
  }

  playWindWhistle() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.05);
    this.noiseBurst(b, b.now, { dur: 1.5, gain: 0.08, from: 450 * v, to: 180 * v });
    this.blip(b, b.now, { type: 'sine', freq: 280 * v, freqTo: 340 * v, dur: 1.2, gain: 0.03 });
  }

  playBoredClap() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.08);
    // Polite/bored 2-3 claps
    this.noiseBurst(b, b.now, { dur: 0.05, gain: 0.09, from: 1200 * v, to: 400 });
    this.noiseBurst(b, b.now + 0.35, { dur: 0.04, gain: 0.07, from: 1100 * v, to: 380 });
    this.noiseBurst(b, b.now + 0.72, { dur: 0.04, gain: 0.06, from: 1050 * v, to: 350 });
  }

  playCrowdReaction(tier: number, isHeavy = false) {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.03);

    if (tier === 1) {
      // Tier 1: Bored / quiet. Occasional polite single clap on heavy hit.
      if (isHeavy) {
        this.noiseBurst(b, b.now, { dur: 0.06, gain: 0.07, from: 900 * v, to: 300 });
      }
    } else if (tier === 2) {
      // Tier 2: Low murmur, occasional jeer/ripple
      this.noiseBurst(b, b.now, { dur: 0.45, gain: 0.1, from: 400 * v, to: 800 });
      if (isHeavy) {
        this.blip(b, b.now + 0.05, { type: 'triangle', freq: 140 * v, freqTo: 90 * v, dur: 0.3, gain: 0.08 });
      }
    } else if (tier === 3) {
      // Tier 3: Solid roar, collective gasp on heavy hit
      if (isHeavy) {
        // Collective gasp: rising suction noise
        this.noiseBurst(b, b.now, { dur: 0.5, gain: 0.18, from: 280 * v, to: 1400 * v });
        this.blip(b, b.now, { type: 'sine', freq: 220 * v, freqTo: 360 * v, dur: 0.4, gain: 0.09 });
      } else {
        this.noiseBurst(b, b.now, { dur: 0.65, gain: 0.16, from: 600 * v, to: 1200 * v });
      }
    } else if (tier === 4) {
      // Tier 4: Deafening roar, rhythmic stomping pulse
      this.noiseBurst(b, b.now, { dur: 0.85, gain: 0.22, from: 500 * v, to: 2000 * v });
      // Stomp / drum thud
      this.blip(b, b.now, { type: 'triangle', freq: 110 * v, freqTo: 38 * v, dur: 0.22, gain: 0.25 });
      this.blip(b, b.now + 0.2, { type: 'triangle', freq: 110 * v, freqTo: 38 * v, dur: 0.22, gain: 0.2 });
    } else {
      // Tier 5: Thunderous acoustic shockwave with dynamic saturation/distortion
      this.noiseBurst(b, b.now, { dur: 1.1, gain: 0.3, from: 400 * v, to: 2600 * v });
      // Deep sub-bass acoustic pressure wave
      this.blip(b, b.now, { type: 'sawtooth', freq: 75 * v, freqTo: 30 * v, dur: 0.7, gain: 0.32 });
      this.blip(b, b.now + 0.02, { type: 'square', freq: 130 * v, freqTo: 55 * v, dur: 0.4, gain: 0.22 });
      this.blip(b, b.now + 0.1, { type: 'sawtooth', freq: 240 * v, freqTo: 120 * v, dur: 0.5, gain: 0.18 });
    }
  }

  playCrowdFatalBlow(tier: number) {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.02);

    if (tier === 1) {
      // Tier 1: Awkward, quiet thud.
      this.noiseBurst(b, b.now, { dur: 0.15, gain: 0.1, from: 300 * v, to: 60 });
      this.blip(b, b.now, { type: 'triangle', freq: 80 * v, freqTo: 35 * v, dur: 0.16, gain: 0.12 });
      // Occasional solitary bored cough/rustle
      this.noiseBurst(b, b.now + 0.4, { dur: 0.08, gain: 0.04, from: 800, to: 200 });
    } else if (tier === 2) {
      // Tier 2: Low collective murmur and sparse applause
      this.noiseBurst(b, b.now, { dur: 0.6, gain: 0.12, from: 350 * v, to: 700 });
      this.noiseBurst(b, b.now + 0.3, { dur: 0.4, gain: 0.08, from: 1000 * v, to: 400 });
    } else if (tier === 3) {
      // Tier 3: Solid arena roar and gasp
      this.noiseBurst(b, b.now, { dur: 1.0, gain: 0.2, from: 500 * v, to: 1600 * v });
      this.blip(b, b.now, { type: 'sine', freq: 160 * v, freqTo: 280 * v, dur: 0.6, gain: 0.12 });
    } else if (tier === 4) {
      // Tier 4: Huge roaring cheer + rhythmic drums
      this.noiseBurst(b, b.now, { dur: 1.4, gain: 0.26, from: 450 * v, to: 2200 * v });
      this.blip(b, b.now, { type: 'triangle', freq: 95 * v, freqTo: 30 * v, dur: 0.45, gain: 0.28 });
      this.blip(b, b.now + 0.18, { type: 'triangle', freq: 110 * v, freqTo: 35 * v, dur: 0.4, gain: 0.24 });
    } else {
      // Tier 5: Massive, unified blood-roar ("Pollice Verso" acoustic pressure wave)
      // Overpowers ambient sounds with saturated wall of sound and bass drop
      this.noiseBurst(b, b.now, { dur: 1.8, gain: 0.35, from: 600 * v, to: 3200 * v });
      this.blip(b, b.now, { type: 'sawtooth', freq: 90 * v, freqTo: 22 * v, dur: 1.2, gain: 0.38 });
      this.blip(b, b.now, { type: 'square', freq: 145 * v, freqTo: 45 * v, dur: 0.8, gain: 0.28 });
      this.blip(b, b.now + 0.08, { type: 'sawtooth', freq: 360 * v, freqTo: 180 * v, dur: 0.9, gain: 0.22 });
      this.blip(b, b.now + 0.2, { type: 'sawtooth', freq: 440 * v, freqTo: 220 * v, dur: 0.8, gain: 0.18 });
    }
  }
  playFootstepStone() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.noiseBurst(b, b.now, { dur: 0.05, gain: 0.08, from: 1000 * v, to: 600 * v });
    this.blip(b, b.now, { type: 'triangle', freq: 300 * v, dur: 0.03, gain: 0.04 });
  }
  playCrowdMurmurBuild() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.02);
    // Low swelling crowd murmur
    this.noiseBurst(b, b.now, { dur: 2.2, gain: 0.18, from: 240 * v, to: 850 * v });
    // Rising tension drone
    this.blip(b, b.now, { type: 'triangle', freq: 65 * v, freqTo: 140 * v, dur: 2.2, gain: 0.12 });
    this.blip(b, b.now + 0.5, { type: 'sawtooth', freq: 90 * v, freqTo: 180 * v, dur: 1.7, gain: 0.08 });
  }

  playElephantTrumpet() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.02);
    // Low frequency thundering rumble (noise burst + sub-bass saw drop)
    this.noiseBurst(b, b.now, { dur: 0.85, gain: 0.24, from: 350 * v, to: 35 });
    this.blip(b, b.now, { type: 'sawtooth', freq: 72 * v, freqTo: 26 * v, dur: 0.95, gain: 0.28 });
    // Brass-like elephant trumpet screech / sweep
    this.blip(b, b.now + 0.04, {
      type: 'sawtooth',
      freq: 380 * v,
      freqTo: 840 * v,
      dur: 0.55,
      gain: 0.18,
      glide: 'lin',
    });
    this.blip(b, b.now + 0.08, {
      type: 'sawtooth',
      freq: 430 * v,
      freqTo: 790 * v,
      dur: 0.5,
      gain: 0.15,
      glide: 'lin',
    });
  }

  playCrowdWhoop() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    // 1. Energetic cheer noise burst (crowd roar swelling and falling)
    this.noiseBurst(b, b.now, { dur: 0.95, gain: 0.16, from: 600 * v, to: 2400 });
    this.noiseBurst(b, b.now + 0.1, { dur: 0.75, gain: 0.14, from: 1200 * v, to: 800 });
    // 2. Harmonic chord / rising triumphant whoop
    const notes = [220, 277.18, 329.63, 440, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      this.blip(b, b.now + 0.05 + idx * 0.04, {
        type: 'sawtooth',
        freq: freq * v,
        freqTo: freq * 1.25 * v,
        dur: 0.5,
        gain: 0.05,
      });
      this.blip(b, b.now + 0.08 + idx * 0.04, {
        type: 'sine',
        freq: freq * v,
        freqTo: freq * 1.3 * v,
        dur: 0.6,
        gain: 0.04,
      });
    });
    // Rising triumphant whoop sweep
    this.blip(b, b.now + 0.12, {
      type: 'triangle',
      freq: 330 * v,
      freqTo: 880 * v,
      dur: 0.45,
      gain: 0.08,
      glide: 'lin',
    });
  }
  playBellRing() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.01);
    const fundamental = 659.25 * v;
    // Bell chime: sine waves at fundamental + 2.76x and 5.4x inharmonic partials with exponential decay
    this.blip(b, b.now, { type: 'sine', freq: fundamental, dur: 1.4, gain: 0.22 });
    this.blip(b, b.now, { type: 'sine', freq: fundamental * 2.76, dur: 0.9, gain: 0.14 });
    this.blip(b, b.now, { type: 'sine', freq: fundamental * 5.4, dur: 0.5, gain: 0.09 });
    this.blip(b, b.now, { type: 'triangle', freq: fundamental * 0.5, dur: 1.0, gain: 0.06 });
  }

  playHoverMicroTone() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.02);
    this.blip(b, b.now, { type: 'sine', freq: 880 * v, dur: 0.03, gain: 0.05 });
  }

  playTypewriterBeep(pitchOffset = 0) {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.03);
    const freq = (580 + pitchOffset * 35) * v;
    this.blip(b, b.now, { type: 'triangle', freq, dur: 0.025, gain: 0.04 });
  }

  playCrispClick() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 1200 * v, dur: 0.015, gain: 0.1 });
  }

  playFootstepWood() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'triangle', freq: 180 * v, freqTo: 60 * v, dur: 0.09, gain: 0.1 });
    this.noiseBurst(b, b.now, { dur: 0.04, gain: 0.05, from: 800, to: 300 });
  }

  playClashSFX() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.02);
    this.blip(b, b.now, { type: 'sine', freq: 3800 * v, dur: 0.35, gain: 0.09 });
    this.blip(b, b.now, { type: 'sine', freq: 4900 * v, dur: 0.3, gain: 0.07 });
    this.blip(b, b.now, { type: 'sine', freq: 6200 * v, dur: 0.22, gain: 0.05 });
    this.blip(b, b.now, { type: 'triangle', freq: 1850 * v, freqTo: 900 * v, dur: 0.18, gain: 0.08 });
    this.noiseBurst(b, b.now, { dur: 0.09, gain: 0.12, from: 4500, to: 1200 });
  }

  playSwordClash() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 2800 * v, dur: 0.25, gain: 0.05 });
    this.blip(b, b.now, { type: 'sine', freq: 3420 * v, dur: 0.2, gain: 0.04 });
    this.blip(b, b.now, { type: 'sine', freq: 4150 * v, dur: 0.15, gain: 0.03 });
    this.blip(b, b.now, { type: 'sine', freq: 4980 * v, dur: 0.1, gain: 0.02 });
    this.noiseBurst(b, b.now, { dur: 0.08, gain: 0.08, from: 3000, to: 800 });
  }

  playMeleePunch() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'triangle', freq: 140 * v, freqTo: 30 * v, dur: 0.15, gain: 0.18 });
    this.noiseBurst(b, b.now, { dur: 0.08, gain: 0.1, from: 600, to: 80 });
  }

  playChiptuneExplosion() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.noiseBurst(b, b.now, { dur: 0.4, gain: 0.2, from: 1000, to: 100 });
    this.blip(b, b.now, { type: 'triangle', freq: 160 * v, freqTo: 30 * v, dur: 0.35, gain: 0.25 });
  }

  playShieldBlock() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 100 * v, freqTo: 30 * v, dur: 0.2, gain: 0.2 });
    this.noiseBurst(b, b.now, { dur: 0.15, gain: 0.12, from: 500, to: 100 });
  }

  playCoinPickup() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'square', freq: 987.77 * v, dur: 0.1, gain: 0.08 });
    this.blip(b, b.now + 0.08, { type: 'square', freq: 1318.51 * v, dur: 0.2, gain: 0.08 });
  }

  playVictoryFanfare() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, i) => {
      this.blip(b, b.now + i * 0.1, { type: 'sawtooth', freq: freq * v, dur: 0.4, gain: 0.06 });
      this.blip(b, b.now + i * 0.1, { type: 'sine', freq: freq * v, dur: 0.4, gain: 0.04 });
    });
    const chordTime = notes.length * 0.1;
    notes.forEach((freq) => {
      this.blip(b, b.now + chordTime, { type: 'triangle', freq: freq * v, dur: 0.8, gain: 0.06 });
    });
  }

  playDefeatMotif() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    const notes = [311.13, 261.63, 246.94, 196.00];
    notes.forEach((freq, i) => {
      this.blip(b, b.now + i * 0.15, { type: 'sawtooth', freq: freq * v, dur: 0.3, gain: 0.08 });
      this.blip(b, b.now + i * 0.15, { type: 'sine', freq: freq * 0.5 * v, dur: 0.35, gain: 0.06 });
    });
  }

  playLevelUpStinger() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      this.blip(b, b.now + i * 0.07, { type: 'sine', freq: freq * v, dur: 0.25, gain: 0.06 });
    });
    const tailTime = notes.length * 0.07;
    this.noiseBurst(b, b.now + tailTime, { dur: 0.8, gain: 0.05, from: 3000, to: 6000 });
    for (let i = 0; i < 5; i++) {
      this.blip(b, b.now + tailTime + i * 0.1, {
        type: 'sine',
        freq: (2000 + i * 500) * this.vary(0.1),
        dur: 0.2,
        gain: 0.03
      });
    }
  }

  playPowerupChime() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
      this.blip(b, b.now + i * 0.06, { type: 'sine', freq: freq * v, dur: 0.15, gain: 0.06 });
    });
  }

  playConfirmSelect() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.blip(b, b.now, { type: 'sine', freq: 523.25 * v, dur: 0.1, gain: 0.08 });
    this.blip(b, b.now + 0.08, { type: 'sine', freq: 783.99 * v, dur: 0.15, gain: 0.1 });
  }

  playHeraldTrumpet() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary(0.01);
    const notes = [
      { f: 261.63, t: 0, d: 0.12 },
      { f: 392.00, t: 0.12, d: 0.12 },
      { f: 523.25, t: 0.24, d: 0.18 },
      { f: 659.25, t: 0.40, d: 0.4 },
    ];
    notes.forEach((n) => {
      this.blip(b, b.now + n.t, { type: 'sawtooth', freq: n.f * v, dur: n.d, gain: 0.08 });
      this.blip(b, b.now + n.t, { type: 'triangle', freq: n.f * v, dur: n.d, gain: 0.06 });
    });
  }

  playSwoosh() {
    const b = this.begin();
    if (!b) return;
    const v = this.vary();
    this.noiseBurst(b, b.now, { dur: 0.12, gain: 0.1, from: 2200 * v, to: 250 });
    this.blip(b, b.now, { type: 'sine', freq: 450 * v, freqTo: 140 * v, dur: 0.12, gain: 0.06 });
  }
}

/** Shared singleton — import and use anywhere. */
export const gameAudio = new GameAudio();

// ============================================================================
// GENERAL UTILITIES & MATH HELPERS
// ============================================================================

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const formatTime = (seconds: number): string => {
  const clamped = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(clamped / 60);
  const remaining = clamped % 60;
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
};

export const prepareCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void => {
  const scale = window.devicePixelRatio || 1;
  const displayWidth = Math.floor(width * scale);
  const displayHeight = Math.floor(height * scale);

  if (
    ctx.canvas.width !== displayWidth ||
    ctx.canvas.height !== displayHeight
  ) {
    ctx.canvas.width = displayWidth;
    ctx.canvas.height = displayHeight;
  }

  ctx.setTransform(scale, 0, 0, scale, 0, 0);
};

export const createFixedStepper = (stepMs: number, maxSubSteps = 5) => {
  let lastTime = 0;
  let accumulator = 0;

  return (time: number, onStep: (deltaSeconds: number) => void): void => {
    if (lastTime === 0) {
      lastTime = time;
      return;
    }

    const frameMs = Math.min(time - lastTime, stepMs * maxSubSteps);
    lastTime = time;
    accumulator += frameMs;

    let steps = 0;
    while (accumulator >= stepMs && steps < maxSubSteps) {
      onStep(stepMs / 1000);
      accumulator -= stepMs;
      steps += 1;
    }
  };
};

/**
 * A 2D coordinate representing a position in the game world.
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * An entity within the game.
 */
export interface Entity extends Position {
  id: string;
  type: string;
  width: number;
  height: number;
  vx: number;
  vy: number;
  [key: string]: any; // Allow flexible properties
}

/**
 * The current phase of the game.
 */
export type GamePhase =
  | 'START'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'LEVEL_COMPLETE';

/**
 * The overall state of the game.
 */
export interface GameState {
  status: GamePhase;
  score: number;
  level: number;
  timer?: number;
  moves?: number;
  lives?: number;
  [key: string]: any; // Allow flexible properties
}

/**
 * The music track to be used in the game.
 */
export interface MusicTrack {
  name: string;
  url: string;
  description: string;
}

declare global {
  interface Window {
    PlaygroundSDK: any;
  }
}

/**
 * Configuration for a sprite sheet.
 */
export interface SpriteConfig {
  url: string;
  frameWidth?: number;
  frameHeight?: number;
  frameCount?: number;
}

/**
 * Preloads all assets defined in the manifest.
 * Returns a dictionary of loaded images (keyed by manifest ID) and a loading state.
 *
 * WARNING: Generated sprites already have transparent backgrounds removed server-side.
 * Do not run client-side `ctx.getImageData()` loops to strip backgrounds. If you ever
 * call `ctx.getImageData()`, wrap it in `try / catch` and fall back to raw `ctx.drawImage()`
 * in case an external asset fell back to `no-cors` loading.
 */
export function useAssets(manifest: Record<string, string>) {
  const [assets, setAssets] = useState<Record<string, HTMLImageElement | null>>(
    {},
  );
  const [isReady, setIsReady] = useState(false);

  // Stringify the manifest to prevent infinite re-renders if an inline object is passed
  const manifestStr = JSON.stringify(manifest);

  useEffect(() => {
    const currentManifest = JSON.parse(manifestStr) as Record<string, string>;
    const urls = Object.entries(currentManifest);
    if (urls.length === 0) {
      setIsReady(true);
      return;
    }

    let loadedCount = 0;
    const loadedAssets: Record<string, HTMLImageElement | null> = {};

    urls.forEach(([id, url]) => {
      const img = new Image();
      let retriedWithoutCors = false;
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedAssets[id] = img; // Keyed by manifest ID for easy lookup
        loadedCount++;
        if (loadedCount === urls.length) {
          setAssets(loadedAssets);
          setIsReady(true);
        }
      };
      img.onerror = () => {
        if (!retriedWithoutCors) {
          retriedWithoutCors = true;
          img.removeAttribute('crossorigin');
          img.src = url;
          return;
        }
        console.warn(`[AssetPreloader] Failed to load asset: ${id} at ${url}`);
        loadedAssets[id] = null;
        loadedCount++;
        if (loadedCount === urls.length) {
          setAssets(loadedAssets);
          setIsReady(true);
        }
      };
      img.src = url;
    });
  }, [manifestStr]);

  return {assets, isReady};
}

/**
 * Safely draws an entire image asset on the canvas. If the asset failed to load,
 * falls back to rendering a primitive geometric shape to prevent crashing.
 *
 * Note: Draws from top-left (consistent with standard Canvas drawImage).
 *
 * WARNING: This draws the WHOLE source image (5-arg drawImage) and does not support
 * frame extraction. For animated spritesheets, use the `html-sprite-renderer` skill
 * (`SpriteRenderer` class) instead.
 */
export function drawAsset(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  fallbackDraw: (ctx: CanvasRenderingContext2D) => void,
) {
  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x, y, w, h);
  } else {
    fallbackDraw(ctx);
  }
}

/**
 * Robust background drawing function.
 * If a background image is provided, it draws it covering the full canvas width and height.
 * If camera coordinates are provided, it can optionally do parallax scrolling.
 * If the image fails to load, it falls back to a solid color.
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  bgImg: HTMLImageElement | null | undefined,
  canvasWidth: number,
  canvasHeight: number,
  fallbackColor = '#222222',
  camX = 0,
  camY = 0,
) {
  if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
    // Parallax logic: scroll the background slightly slower than the camera
    const parallaxFactor = 0.5;
    const bgX = (camX * parallaxFactor) % canvasWidth;
    const bgY = (camY * parallaxFactor) % canvasHeight;

    // Draw a 2x2 grid of the background image to ensure the whole screen is covered during scrolling
    ctx.drawImage(bgImg, -bgX, -bgY, canvasWidth, canvasHeight);
    ctx.drawImage(bgImg, -bgX + canvasWidth, -bgY, canvasWidth, canvasHeight);
    ctx.drawImage(bgImg, -bgX, -bgY + canvasHeight, canvasWidth, canvasHeight);
    ctx.drawImage(
      bgImg,
      -bgX + canvasWidth,
      -bgY + canvasHeight,
      canvasWidth,
      canvasHeight,
    );
  } else {
    // Fallback to solid color
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }
}

/**
 * Detect mobile/touch devices.
 * Checks user agent, pointer capability, and viewport width.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    const ua =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    const touch =
      window.matchMedia('(pointer: coarse)').matches ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;
    const small = window.innerWidth < 768;
    return ua || touch || small;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth < 768 ||
          window.matchMedia('(pointer: coarse)').matches ||
          'ontouchstart' in window ||
          navigator.maxTouchPoints > 0,
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
