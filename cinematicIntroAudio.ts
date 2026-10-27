// Ludus Champion - Procedural 16-Bit Retro Chiptune & Synth Intro Music Engine
// Synthesizes a high-energy, heroic, driving retro gladiatorial tournament soundtrack
// using Web Audio API: pulse/square leads, resonant driving bass, chiptune drums, and brass stabs.
// tslint:disable
/* eslint-disable */

import {gameAudio} from './utils/helper';

// Frequency constants for D Phrygian / D Minor antiquity scale
const NOTE = {
  C2: 65.41,
  D2: 73.42,
  Eb2: 77.78,
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  Bb2: 116.54,
  C3: 130.81,
  Cs3: 138.59,
  D3: 146.83,
  Eb3: 155.56,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  Bb3: 233.08,
  C4: 261.63,
  D4: 293.66,
  Eb4: 311.13,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  C5: 523.25,
  D5: 587.33,
  Eb5: 622.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
} as const;

export class CinematicIntroMusicEngine {
  private isRunning = false;
  private currentPhase = 0;
  private currentStep = 0;
  private nextStepTime = 0;
  private timerId: number | null = null;
  private isMuted = false;
  private volume = 0.55;

  // Master Gain routing
  private introMasterGain: GainNode | null = null;
  private leadGain: GainNode | null = null;
  private bassGain: GainNode | null = null;
  private drumGain: GainNode | null = null;
  private brassGain: GainNode | null = null;

  // Filter nodes for dynamic intensity
  private bassFilter: BiquadFilterNode | null = null;
  private brassFilter: BiquadFilterNode | null = null;

  // 138 BPM: 1 beat = ~0.4348s, 1 sixteenth-note = ~0.1087s
  private readonly STEP_TIME = 60 / 138 / 4; // 16th note step duration

  /**
   * Initializes audio nodes connected to the gameAudio master output.
   */
  private initNodes(ctx: AudioContext) {
    if (this.introMasterGain) return;

    const masterOut = gameAudio.getMasterGain() || ctx.destination;

    this.introMasterGain = ctx.createGain();
    this.introMasterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, ctx.currentTime);
    this.introMasterGain.connect(masterOut);

    // Sub-mix gains for independent track balancing
    this.leadGain = ctx.createGain();
    this.leadGain.gain.setValueAtTime(0.22, ctx.currentTime);
    this.leadGain.connect(this.introMasterGain);

    this.bassGain = ctx.createGain();
    this.bassGain.gain.setValueAtTime(0.3, ctx.currentTime);
    this.bassFilter = ctx.createBiquadFilter();
    this.bassFilter.type = 'lowpass';
    this.bassFilter.frequency.setValueAtTime(950, ctx.currentTime);
    this.bassFilter.Q.setValueAtTime(3.5, ctx.currentTime);
    this.bassGain.connect(this.bassFilter);
    this.bassFilter.connect(this.introMasterGain);

    this.drumGain = ctx.createGain();
    this.drumGain.gain.setValueAtTime(0.32, ctx.currentTime);
    this.drumGain.connect(this.introMasterGain);

    this.brassGain = ctx.createGain();
    this.brassGain.gain.setValueAtTime(0.24, ctx.currentTime);
    this.brassFilter = ctx.createBiquadFilter();
    this.brassFilter.type = 'lowpass';
    this.brassFilter.frequency.setValueAtTime(1800, ctx.currentTime);
    this.brassFilter.Q.setValueAtTime(2.0, ctx.currentTime);
    this.brassGain.connect(this.brassFilter);
    this.brassFilter.connect(this.introMasterGain);
  }

  /**
   * Starts or resumes playback of the high-energy retro intro theme.
   */
  start(phase = 0) {
    const ctx = gameAudio.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    this.initNodes(ctx);
    this.currentPhase = phase;
    this.applyPhaseAtmosphere(phase, ctx.currentTime);

    if (this.isRunning) return;

    this.isRunning = true;
    this.currentStep = 0;
    this.nextStepTime = ctx.currentTime + 0.05;

    // Reset master gain ramp if it was fading out
    if (this.introMasterGain) {
      this.introMasterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.introMasterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, ctx.currentTime);
    }

    this.scheduleLoop();
  }

  /**
   * Updates cinematic intro phase to adjust track layers, filters, and dramatic stabs.
   */
  setPhase(phase: number) {
    this.currentPhase = phase;
    const ctx = gameAudio.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    if (!this.isRunning && phase < 4) {
      this.start(phase);
      return;
    }

    this.applyPhaseAtmosphere(phase, ctx.currentTime);

    // Trigger dramatic brass fanfare stabs on key cinematic events!
    if (phase === 1) {
      // Phase 1 (The Approach): Hit heavy power chord as fighters advance
      this.triggerBrassStab(
        [NOTE.D3, NOTE.A3, NOTE.D4, NOTE.F4],
        ctx.currentTime + 0.02,
        0.8,
        true,
      );
    } else if (phase === 2) {
      // Phase 2 (The Title): Massive imperial Roman fanfare chord!
      this.triggerBrassStab(
        [NOTE.D3, NOTE.A3, NOTE.D4, NOTE.F4, NOTE.A4],
        ctx.currentTime + 0.02,
        1.2,
        true,
      );
      this.triggerCrashCymbal(ctx.currentTime + 0.02);
    } else if (phase === 3) {
      // Phase 3 (The Monologue): Subdued atmospheric resolve
      this.triggerBrassStab(
        [NOTE.D3, NOTE.A3, NOTE.C4, NOTE.E4],
        ctx.currentTime + 0.02,
        1.8,
        false,
      );
    } else if (phase >= 4) {
      // Concluding into Main Game: Smoothly fade out
      this.stop(0.8);
    }
  }

  /**
   * Hits a dramatic fanfare brass stab when the camera pans past the Emperor on the balcony.
   */
  triggerEmperorPanStab() {
    const ctx = gameAudio.getContext();
    if (!ctx) return;
    this.triggerBrassStab(
      [NOTE.Eb3, NOTE.Bb3, NOTE.Eb4, NOTE.G4],
      ctx.currentTime + 0.02,
      1.1,
      true,
    );
    this.triggerCrashCymbal(ctx.currentTime + 0.02);
  }

  /**
   * Adjusts instrument layers and filter cutoffs based on current intro narrative phase.
   */
  private applyPhaseAtmosphere(phase: number, time: number) {
    if (!this.bassFilter || !this.leadGain || !this.drumGain || !this.brassFilter) return;

    if (phase === 0) {
      // Phase 0: The Manager on Terrace - building anticipation
      this.bassFilter.frequency.setTargetAtTime(800, time, 0.15);
      this.leadGain.gain.setTargetAtTime(0.16, time, 0.15);
      this.drumGain.gain.setTargetAtTime(0.24, time, 0.15);
      this.brassFilter.frequency.setTargetAtTime(1400, time, 0.15);
    } else if (phase === 1) {
      // Phase 1: The Approach & Pan-Up - high-energy battle march!
      this.bassFilter.frequency.setTargetAtTime(1300, time, 0.15);
      this.leadGain.gain.setTargetAtTime(0.26, time, 0.15);
      this.drumGain.gain.setTargetAtTime(0.35, time, 0.15);
      this.brassFilter.frequency.setTargetAtTime(2400, time, 0.15);
    } else if (phase === 2) {
      // Phase 2: Title Reveal - Maximum hype explosion!
      this.bassFilter.frequency.setTargetAtTime(1600, time, 0.1);
      this.leadGain.gain.setTargetAtTime(0.32, time, 0.1);
      this.drumGain.gain.setTargetAtTime(0.38, time, 0.1);
      this.brassFilter.frequency.setTargetAtTime(3200, time, 0.1);
    } else if (phase === 3) {
      // Phase 3: The Monologue - Atmospheric, mysterious, gentle cadence so typewriter text shines
      this.bassFilter.frequency.setTargetAtTime(420, time, 0.25);
      this.leadGain.gain.setTargetAtTime(0.12, time, 0.25);
      this.drumGain.gain.setTargetAtTime(0.15, time, 0.25);
      this.brassFilter.frequency.setTargetAtTime(850, time, 0.25);
    }
  }

  /**
   * Smoothly fades out and halts the intro soundtrack.
   */
  stop(fadeDuration = 0.6) {
    try {
      if (!this.isRunning) return;

      const ctx = gameAudio.getContext();
      if (ctx && this.introMasterGain) {
        this.introMasterGain.gain.cancelScheduledValues(ctx.currentTime);
        this.introMasterGain.gain.setValueAtTime(this.introMasterGain.gain.value, ctx.currentTime);
        this.introMasterGain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + Math.max(0.1, fadeDuration),
        );
      }

      setTimeout(() => {
        this.isRunning = false;
        if (this.timerId !== null) {
          window.clearTimeout(this.timerId);
          this.timerId = null;
        }
      }, fadeDuration * 1000 + 50);
    } catch (err) {
      console.warn('[CinematicIntroMusic] stop error:', err);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      const ctx = gameAudio.getContext();
      if (this.introMasterGain && ctx) {
        this.introMasterGain.gain.setTargetAtTime(
          muted ? 0 : this.volume,
          ctx.currentTime,
          0.02,
        );
      }
    } catch (_) {}
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      const ctx = gameAudio.getContext();
      if (this.introMasterGain && ctx && !this.isMuted) {
        this.introMasterGain.gain.setTargetAtTime(this.volume, ctx.currentTime, 0.02);
      }
    } catch (_) {}
  }

  /**
   * Web Audio Look-Ahead Scheduler loop. Runs every 25ms, scheduling notes up to 100ms in advance.
   */
  private scheduleLoop = () => {
    if (!this.isRunning) return;

    try {
      const ctx = gameAudio.getContext();
      if (!ctx) return;

      const scheduleAheadTime = 0.12;

      while (this.nextStepTime < ctx.currentTime + scheduleAheadTime) {
        this.scheduleStep(this.currentStep, this.nextStepTime, ctx);
        this.nextStepTime += this.STEP_TIME;
        this.currentStep = (this.currentStep + 1) % 64; // 64 sixteenth-notes = 4 measures loop
      }

      this.timerId = window.setTimeout(this.scheduleLoop, 25);
    } catch (err) {
      console.warn('[CinematicIntroMusic] scheduleLoop error:', err);
    }
  };

  /**
   * Schedules a single 16th-note subdivision across bass, lead, and percussion tracks.
   */
  private scheduleStep(step: number, time: number, ctx: AudioContext) {
    const isMonologue = this.currentPhase === 3;

    // 1. DRIVING ARPEGGIATED BASSLINE
    this.scheduleBass(step, time, ctx, isMonologue);

    // 2. CHIPTUNE DRUMS & PERCUSSION
    this.scheduleDrums(step, time, ctx, isMonologue);

    // 3. HEROIC 16-BIT SQUARE LEAD
    this.scheduleLead(step, time, ctx, isMonologue);

    // 4. PERIODIC HARMONIC STABS (Measure accents)
    if (step % 16 === 0) {
      this.scheduleMeasureChord(step, time, isMonologue);
    }
  }

  // --- 1. DRIVING BASSLINE SYNTHESIS ---
  private scheduleBass(step: number, time: number, ctx: AudioContext, isMellow: boolean) {
    if (!this.bassGain) return;

    // 64-step driving 16th-note galloping bass in D Phrygian:
    // Bar 1: D2, D2, D3, D2, Eb2, Eb2, Eb3, Eb2, D2, D2, D3, D2, C2, C2, C3, C2
    // Bar 2: D2, D2, D3, D2, F2, F2, F3, F2, G2, G2, A2, A2, Bb2, Bb2, C3, Cs3
    // Bar 3: D2, D2, D3, D2, Eb2, Eb2, Eb3, Eb2, F2, F2, F3, F2, G2, G2, G3, G2
    // Bar 4: A2, A2, Bb2, Bb2, C3, C3, Cs3, Cs3, D3, A2, F2, D2, D2, D2, D2, D2
    const pattern = [
      // Bar 1
      NOTE.D2, NOTE.D2, NOTE.D3, NOTE.D2, NOTE.Eb2, NOTE.Eb2, NOTE.Eb3, NOTE.Eb2,
      NOTE.D2, NOTE.D2, NOTE.D3, NOTE.D2, NOTE.C2, NOTE.C2, NOTE.C3, NOTE.C2,
      // Bar 2
      NOTE.D2, NOTE.D2, NOTE.D3, NOTE.D2, NOTE.F2, NOTE.F2, NOTE.F3, NOTE.F2,
      NOTE.G2, NOTE.G2, NOTE.A2, NOTE.A2, NOTE.Bb2, NOTE.Bb2, NOTE.C3, NOTE.Cs3,
      // Bar 3
      NOTE.D2, NOTE.D2, NOTE.D3, NOTE.D2, NOTE.Eb2, NOTE.Eb2, NOTE.Eb3, NOTE.Eb2,
      NOTE.F2, NOTE.F2, NOTE.F3, NOTE.F2, NOTE.G2, NOTE.G2, NOTE.G3, NOTE.G2,
      // Bar 4
      NOTE.A2, NOTE.A2, NOTE.Bb2, NOTE.Bb2, NOTE.C3, NOTE.C3, NOTE.Cs3, NOTE.Cs3,
      NOTE.D3, NOTE.A2, NOTE.F2, NOTE.D2, NOTE.D2, NOTE.D3, NOTE.D2, NOTE.D3,
    ];

    const freq = pattern[step % pattern.length];
    const dur = this.STEP_TIME * (step % 2 === 0 ? 0.92 : 0.75);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isMellow ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    const peak = isMellow ? 0.12 : 0.22;
    gain.gain.setValueAtTime(peak, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(gain);
    gain.connect(this.bassGain);

    osc.start(time);
    osc.stop(time + dur + 0.01);
  }

  // --- 2. CHIPTUNE DRUMS & PERCUSSION ---
  private scheduleDrums(step: number, time: number, ctx: AudioContext, isMellow: boolean) {
    if (!this.drumGain) return;

    const barStep = step % 16;

    // Driving Battle Kick Drum:
    // Beats 0, 4, 7, 10, 12 (driving syncopation)
    const isKick =
      barStep === 0 ||
      barStep === 4 ||
      barStep === 7 ||
      barStep === 10 ||
      barStep === 12;

    if (isKick) {
      this.triggerKick(time, isMellow);
    }

    // Snare Crack:
    // Backbeats 4 and 12, plus rapid 16th roll at step 14, 15 on Bar 4
    const isSnare =
      barStep === 4 ||
      barStep === 12 ||
      (step >= 60 && (barStep === 14 || barStep === 15));

    if (isSnare && !isMellow) {
      this.triggerSnare(time, barStep >= 14 ? 0.5 : 1.0);
    }

    // Hi-Hats:
    // 16th note chatter, open hat on off-beat sixteenths 2, 6, 10, 14
    const isOpen = barStep === 2 || barStep === 6 || barStep === 10 || barStep === 14;
    this.triggerHiHat(time, isOpen, isMellow);
  }

  /** Punchy frequency-swept sine wave kick */
  private triggerKick(time: number, isMellow: boolean) {
    const ctx = gameAudio.getContext();
    if (!ctx || !this.drumGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = isMellow ? 120 : 175;
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.08);

    const peak = isMellow ? 0.2 : 0.38;
    gain.gain.setValueAtTime(peak, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(gain);
    gain.connect(this.drumGain);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  /** Noise-based chiptune snare with filtered white noise + body */
  private triggerSnare(time: number, intensity = 1.0) {
    const ctx = gameAudio.getContext();
    if (!ctx || !this.drumGain) return;

    const dur = 0.11;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, time);
    filter.Q.setValueAtTime(1.8, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24 * intensity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    // Mid-frequency transient body
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(190, time);
    bodyOsc.frequency.exponentialRampToValueAtTime(60, time + 0.06);
    bodyGain.gain.setValueAtTime(0.18 * intensity, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.drumGain);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(this.drumGain);

    src.start(time);
    src.stop(time + dur);
    bodyOsc.start(time);
    bodyOsc.stop(time + 0.07);
  }

  /** High-passed noise burst hi-hat */
  private triggerHiHat(time: number, isOpen: boolean, isMellow: boolean) {
    const ctx = gameAudio.getContext();
    if (!ctx || !this.drumGain) return;

    const dur = isOpen ? (isMellow ? 0.06 : 0.12) : 0.035;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(isMellow ? 6500 : 7800, time);

    const gain = ctx.createGain();
    const peak = isOpen ? (isMellow ? 0.07 : 0.16) : isMellow ? 0.04 : 0.09;
    gain.gain.setValueAtTime(peak, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.drumGain);

    src.start(time);
    src.stop(time + dur);
  }

  /** Wide white noise crash cymbal wash for dramatic section entries */
  private triggerCrashCymbal(time: number) {
    const ctx = gameAudio.getContext();
    if (!ctx || !this.drumGain) return;

    const dur = 0.8;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4500, time);
    filter.Q.setValueAtTime(1.2, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.drumGain);

    src.start(time);
    src.stop(time + dur);
  }

  // --- 3. HEROIC 16-BIT SQUARE-WAVE / PULSE LEAD ---
  private scheduleLead(step: number, time: number, ctx: AudioContext, isMellow: boolean) {
    if (!this.leadGain) return;

    // Melody definition across 64 steps:
    // High-energy heroic gladiatorial anthem in D Phrygian / Minor:
    // Notes: [freq, stepDuration] or 0 for rests
    const leadMap: Record<number, number> = {
      // Measure 1: Heroic fanfare motif
      0: NOTE.D4,
      2: NOTE.F4,
      4: NOTE.G4,
      6: NOTE.A4,
      8: NOTE.Bb4,
      10: NOTE.A4,
      12: NOTE.G4,
      14: NOTE.F4,
      // Measure 2: Leaping ancient Phrygian run
      16: NOTE.A4,
      18: NOTE.D5,
      20: NOTE.C5,
      22: NOTE.Bb4,
      24: NOTE.A4,
      26: NOTE.G4,
      28: NOTE.F4,
      30: NOTE.Eb4,
      // Measure 3: Driving fast 16th-note triumph
      32: NOTE.D4,
      34: NOTE.D4,
      36: NOTE.Eb4,
      38: NOTE.F4,
      40: NOTE.G4,
      42: NOTE.A4,
      44: NOTE.Bb4,
      46: NOTE.C5,
      // Measure 4: Soaring climactic peak!
      48: NOTE.D5,
      50: NOTE.D5,
      52: NOTE.Eb5,
      54: NOTE.D5,
      56: NOTE.A4,
      58: NOTE.Bb4,
      60: NOTE.A4,
      62: NOTE.F4,
    };

    const freq = leadMap[step];
    if (!freq) return;

    const noteDur = this.STEP_TIME * 1.8;

    // Dual detuned oscillators for that rich 16-bit arcade chorus bite!
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = isMellow ? 'triangle' : 'square';
    osc2.type = isMellow ? 'sine' : 'square';

    // ±4 cents detune for 16-bit arcade pulse-width / chorus emulation
    osc1.frequency.setValueAtTime(freq * 0.998, time);
    osc2.frequency.setValueAtTime(freq * 1.002, time);

    // Subtle pitch vibrato on longer sustained notes
    if (step % 8 === 0 && !isMellow) {
      osc1.frequency.setTargetAtTime(freq * 1.01, time + 0.08, 0.04);
      osc2.frequency.setTargetAtTime(freq * 0.99, time + 0.08, 0.04);
    }

    const peak = isMellow ? 0.08 : 0.16;
    gain.gain.setValueAtTime(peak, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + noteDur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.leadGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + noteDur + 0.01);
    osc2.stop(time + noteDur + 0.01);
  }

  // --- 4. SYNTH BRASS & PAD STABS FOR DRAMATIC ACCENTS ---
  private scheduleMeasureChord(step: number, time: number, isMellow: boolean) {
    // Chords on downbeats:
    // Step 0: Dm (D3, A3, F4)
    // Step 16: Bb (Bb2, F3, D4)
    // Step 32: C (C3, G3, E4)
    // Step 48: D Phrygian (D3, Bb3, Eb4 -> D4)
    let chord: number[] = [NOTE.D3, NOTE.A3, NOTE.F4];
    if (step === 16) {
      chord = [NOTE.Bb2, NOTE.F3, NOTE.D4];
    } else if (step === 32) {
      chord = [NOTE.C3, NOTE.G3, NOTE.E4];
    } else if (step === 48) {
      chord = [NOTE.D3, NOTE.A3, NOTE.Eb4, NOTE.D4];
    }

    this.triggerBrassStab(chord, time, this.STEP_TIME * 3.5, !isMellow);
  }

  /**
   * Powerful multi-oscillator detuned brass stab with resonant filter sweep.
   */
  private triggerBrassStab(chord: number[], time: number, duration: number, isLoud: boolean) {
    const ctx = gameAudio.getContext();
    if (!ctx || !this.brassGain || !this.brassFilter) return;

    // Filter sweep: opens brightly, then snaps back
    this.brassFilter.frequency.cancelScheduledValues(time);
    this.brassFilter.frequency.setValueAtTime(800, time);
    this.brassFilter.frequency.linearRampToValueAtTime(isLoud ? 3200 : 1600, time + 0.05);
    this.brassFilter.frequency.exponentialRampToValueAtTime(700, time + duration);

    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isLoud ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      const peak = isLoud ? 0.09 : 0.05;
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(peak, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.brassGain!);

      osc.start(time);
      osc.stop(time + duration + 0.02);
    });
  }
}

/** Global singleton instance for cinematic intro audio */
export const cinematicIntroMusic = new CinematicIntroMusicEngine();
