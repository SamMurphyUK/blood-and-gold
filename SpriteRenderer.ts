export interface SpriteActionConfig {
  imageUrl: string;
  totalFrames: number;
  frameWidth: number;
  frameHeight: number;
  fps: number;
  loop?: boolean;
}

export interface SpriteAnimationState {
  currentAction: string;
  currentFrame: number;
  timer: number;
  flipX?: boolean;
}

export class SpriteRenderer {
  private configs: Record<string, SpriteActionConfig>;

  constructor(configs: Record<string, SpriteActionConfig>) {
    this.configs = configs;
  }

  /**
   * Advances the animation state based on delta time.
   */
  getNextState(
    currentState: SpriteAnimationState,
    deltaTime: number,
  ): SpriteAnimationState {
    const config = this.configs[currentState.currentAction];
    if (!config) return currentState;

    const nextState = {...currentState};
    nextState.timer += deltaTime;
    const frameDuration = 1 / (config.fps || 8);

    if (nextState.timer >= frameDuration) {
      const framesToAdvance = Math.floor(nextState.timer / frameDuration);
      nextState.timer %= frameDuration;
      
      if (config.loop === false) {
        if (nextState.currentFrame + framesToAdvance >= config.totalFrames) {
          nextState.currentFrame = config.totalFrames - 1;
        } else {
          nextState.currentFrame += framesToAdvance;
        }
      } else {
        nextState.currentFrame =
          (nextState.currentFrame + framesToAdvance) % Math.max(1, config.totalFrames);
      }
    }
    return nextState;
  }

  /**
   * Draws the sprite to the canvas using preloaded images with optional flipping.
   */
  draw(
    ctx: CanvasRenderingContext2D,
    state: SpriteAnimationState,
    x: number,
    y: number,
    width: number,
    height: number,
    loadedImages: Record<string, HTMLImageElement | null>,
  ) {
    const config = this.configs[state.currentAction];
    if (!config) return;

    const img = loadedImages[config.imageUrl];

    if (!img || !img.complete || img.naturalWidth === 0) {
      // Fallback: draw a styled silhouette if image missing
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x, y, width, height);
      return;
    }

    const framesPerRow = Math.max(1, Math.floor(img.width / config.frameWidth));
    const safeFrame = state.currentFrame % Math.max(1, config.totalFrames);
    const sourceX = (safeFrame % framesPerRow) * config.frameWidth;
    const sourceY = Math.floor(safeFrame / framesPerRow) * config.frameHeight;

    ctx.save();
    if (state.flipX) {
      ctx.translate(x + width, y);
      ctx.scale(-1, 1);
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        config.frameWidth,
        config.frameHeight,
        0,
        0,
        width,
        height,
      );
    } else {
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        config.frameWidth,
        config.frameHeight,
        x,
        y,
        width,
        height,
      );
    }
    ctx.restore();
  }
}
