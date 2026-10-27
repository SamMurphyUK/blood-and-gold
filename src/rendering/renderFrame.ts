// Moved out of App.tsx (Stage 2B rendering extraction). No logic changes.
// renderFrame is the old inner draw() closure: same statements, same order. The three mode branches
// became drawCamp / drawPodium / drawArena (and the two hi-res overlays), called from the same spots.

import {PALETTE} from '../../constants';
import {drawArena, drawArenaOverlay} from './arena/drawArena';
import {drawCamp, drawCampOverlay} from './camp/drawCamp';
import {renderPhase1, renderPhase2And3, renderPhase4, renderPhase5} from './cinematicIntro';
import {getSafeNow} from './frameTime';
import {LOGIC_HEIGHT, LOGIC_WIDTH} from './primitives';
import {drawPodium} from './ui/drawPodium';
import type {RenderView} from './view';
import {prepareCanvas} from '../../utils/helper';

export function renderFrame(view: RenderView, displayCtx: CanvasRenderingContext2D) {
  const {
    offscreenCanvasRef,
    screenShakeTimerRef,
    cinematicStateRef,
    cinematicPhaseStartTimeRef,
    typewriterCharCountRef,
    isTypewriterDoneRef,
    canvasWidth,
    canvasHeight,
    particlesRef,
    flyingGoldCoinsRef,
    mode,
    judgmentState,
  } = view;

  const offscreen = offscreenCanvasRef.current;
  if (!offscreen) return;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;

  offCtx.save();
  offCtx.imageSmoothingEnabled = false;

  // Clear low-res pixel canvas
  offCtx.fillStyle = PALETTE[5];
  offCtx.fillRect(0, 0, LOGIC_WIDTH, LOGIC_HEIGHT);

  if (screenShakeTimerRef.current > 0 && !isNaN(screenShakeTimerRef.current)) {
    const intensity = Math.min(1, Math.max(0, screenShakeTimerRef.current / 0.35));
    const shakeMag = Math.max(0, 3.5 * intensity);
    const shakeX = (Math.random() - 0.5) * shakeMag * 2;
    const shakeY = (Math.random() - 0.5) * shakeMag * 2;
    if (Number.isFinite(shakeX) && Number.isFinite(shakeY)) {
      offCtx.translate(Math.round(shakeX), Math.round(shakeY));
    }
  }

  // ========================================================================
  // CINEMATIC 16-BIT INTRO RENDERING (PHASES 0 TO 3)
  // ========================================================================
  if (cinematicStateRef.current < 4) {
    const now = getSafeNow();
    if (isNaN(cinematicPhaseStartTimeRef.current) || !cinematicPhaseStartTimeRef.current) {
      cinematicPhaseStartTimeRef.current = now;
    }
    let elapsed = Math.max(0, (now - cinematicPhaseStartTimeRef.current) / 1000);
    if (isNaN(elapsed)) {
      elapsed = 0;
    }
    const cState = Math.max(0, Math.min(3, cinematicStateRef.current || 0));

    if (cState === 0) {
      // Phase 1: The Manager
      renderPhase1(offCtx, LOGIC_WIDTH, LOGIC_HEIGHT, elapsed);
    } else if (cState === 1) {
      // Phase 2 & 3: The Approach & The Pan-Up
      renderPhase2And3(offCtx, LOGIC_WIDTH, LOGIC_HEIGHT, elapsed);
    } else if (cState === 2) {
      // Phase 4: The Title
      renderPhase4(offCtx, LOGIC_WIDTH, LOGIC_HEIGHT, elapsed);
    } else if (cState === 3) {
      // Phase 5: The Monologue (Visual Novel UI + Typewriter)
      renderPhase5(
        offCtx,
        LOGIC_WIDTH,
        LOGIC_HEIGHT,
        elapsed,
        typewriterCharCountRef.current || 0,
        isTypewriterDoneRef.current,
      );
    }

    // Transfer low-res offscreen canvas to main canvas at 4x scale
    offCtx.restore();
    prepareCanvas(displayCtx, canvasWidth, canvasHeight);
    displayCtx.imageSmoothingEnabled = false;
    displayCtx.drawImage(offscreen, 0, 0, canvasWidth, canvasHeight);
    return;
  }

  if (mode === 'camp') {
    drawCamp(view, offCtx);
  } else if (mode === 'podium') {
    drawPodium(view, offCtx);
  } else {
    drawArena(view, offCtx);
  }

  // Draw pixel particles (blood droplets & sparkles)
  particlesRef.current.forEach((p) => {
    offCtx.save();
    const alpha = Math.max(0, p.life / p.maxLife);
    offCtx.globalAlpha = alpha;
    offCtx.fillStyle = p.color;
    offCtx.fillRect(Math.round(p.x), Math.round(p.y), p.size || 1, p.size || 1);
    offCtx.restore();
  });

  // Transfer low-res offscreen canvas to main canvas at 4x scale
  offCtx.restore();
  prepareCanvas(displayCtx, canvasWidth, canvasHeight);
  displayCtx.imageSmoothingEnabled = false;
  displayCtx.drawImage(offscreen, 0, 0, canvasWidth, canvasHeight);

  // ========================================================================
  // CRISP HIGH-RESOLUTION VECTOR TEXT & OVERLAYS ON DISPLAY CANVAS
  // Renders overhead names, HP/Stamina bars, and status badges with 100% sharp
  // vector text, crisp antialiasing and zero blur!
  // ========================================================================
  if (mode === 'camp') {
    drawCampOverlay(view, displayCtx);
  } else if (mode === 'arena') {
    if (judgmentState.active) {
      return; // Suppress combat HUD and vector plates during Emperor's Judgment cinematic
    }
    drawArenaOverlay(view, displayCtx);
  }

  // Render Flying Gold Coin Particles on High-Res Display Canvas
  if (flyingGoldCoinsRef.current.length > 0) {
    displayCtx.save();
    displayCtx.imageSmoothingEnabled = true;
    flyingGoldCoinsRef.current.forEach((coin) => {
      if (coin.progress <= 0) return;
      const cx = Math.round(coin.x);
      const cy = Math.round(coin.y);
      const s = coin.size;

      // Trailing sparkling flare
      displayCtx.fillStyle = coin.glowColor;
      displayCtx.fillRect(cx - 1, cy - 1, 3, 3);

      displayCtx.save();
      displayCtx.translate(cx, cy);
      displayCtx.rotate(coin.rotation);

      // Coin shadow & rim
      displayCtx.fillStyle = '#7f644b';
      displayCtx.fillRect(-s / 2 - 1, -s / 2 - 1, s + 2, s + 2);
      // Gold body
      displayCtx.fillStyle = coin.color;
      displayCtx.fillRect(-s / 2, -s / 2, s, s);
      // Radiant center (#F7DEAA)
      displayCtx.fillStyle = '#F7DEAA';
      displayCtx.fillRect(-s / 2 + 1, -s / 2 + 1, Math.max(1, s - 2), Math.max(1, s - 2));

      // Specular glint
      displayCtx.fillStyle = '#ffffff';
      displayCtx.fillRect(-1, -1, 2, 2);

      displayCtx.restore();
    });
    displayCtx.restore();
  }
}
