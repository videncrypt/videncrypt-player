import { EventEmitter, type EventMapBase } from './events';
import { createIframe, destroyIframe } from './iframe';
import { isValidVideoId } from './utils';
import type {
  PlayerOptions,
  PlayerState,
  PlayerEventMap,
  IframeMessage,
  IframeCommand,
  IframeAction,
  PlayerError,
} from './types';

// ── Defaults ───────────────────────────────────────────────

const DEFAULTS = {
  width:        '100%',
  aspectRatio:  '16/9',
  title:        '',
  autoPlay:     false,
  muted:        false,
  loop:         false,
  startTime:    0,
  showControls: true,
  showBranding: true,
  primaryColor: '#2563EB',
  embedBaseUrl: 'https://app.videncrypt.com',
} as const;

// ── VidEncryptPlayer ───────────────────────────────────────

export class VidEncryptPlayer {
  private opts:       Required<PlayerOptions>;
  private container:  HTMLElement;
  private iframe:     HTMLIFrameElement | null = null;
  private wrapper:    HTMLElement | null       = null;
  private emitter:    EventEmitter<PlayerEventMap>;
  private msgHandler: (e: MessageEvent) => void;
  private destroyed   = false;

  private state: PlayerState = {
    playing:     false,
    muted:       false,
    currentTime: 0,
    duration:    0,
    fullscreen:  false,
    ready:       false,
  };

  constructor(options: PlayerOptions) {

    // ── Resolve container ────────────────────────────────
    if (typeof options.container === 'string') {
      const el = document.querySelector(options.container);
      if (!el) {
        throw new Error(
          `VidEncrypt: container "${options.container}" not found`,
        );
      }
      this.container = el as HTMLElement;
    } else if (options.container instanceof HTMLElement) {
      this.container = options.container;
    } else {
      throw new Error(
        'VidEncrypt: container must be a CSS selector or HTMLElement',
      );
    }

    // ── Validate videoId ─────────────────────────────────
    if (!isValidVideoId(options.videoId)) {
      throw new Error(
        'VidEncrypt: videoId is required and must be a non-empty string',
      );
    }

    // ── Merge options with defaults ──────────────────────
    this.opts = {
      ...DEFAULTS,
      ...options,
      // Strip undefined callbacks so they don't overwrite defaults
      onReady:            options.onReady            ?? undefined,
      onPlay:             options.onPlay             ?? undefined,
      onPause:            options.onPause            ?? undefined,
      onEnded:            options.onEnded            ?? undefined,
      onProgress:         options.onProgress         ?? undefined,
      onError:            options.onError            ?? undefined,
      onFullscreenChange: options.onFullscreenChange ?? undefined,
    } as Required<PlayerOptions>;

    // ── Event emitter ────────────────────────────────────
    this.emitter = new EventEmitter<PlayerEventMap>();

    // Wire option callbacks to the emitter
    if (options.onReady) {
      this.emitter.on('ready', options.onReady);
    }
    if (options.onPlay) {
      this.emitter.on('play', options.onPlay);
    }
    if (options.onPause) {
      this.emitter.on('pause', options.onPause);
    }
    if (options.onEnded) {
      this.emitter.on('ended', options.onEnded);
    }
    if (options.onProgress) {
      this.emitter.on('progress', (d) =>
        options.onProgress!(d.currentTime, d.duration),
      );
    }
    if (options.onError) {
      this.emitter.on('error', options.onError);
    }
    if (options.onFullscreenChange) {
      this.emitter.on('fullscreenchange', options.onFullscreenChange);
    }

    // ── postMessage listener ─────────────────────────────
    this.msgHandler = this.handleMessage.bind(this);
    window.addEventListener('message', this.msgHandler);

    // ── Create iframe ────────────────────────────────────
    const { iframe, wrapper } = createIframe(this.opts);
    this.iframe  = iframe;
    this.wrapper = wrapper;
    this.container.appendChild(wrapper);
  }

  // ── Playback controls ──────────────────────────────────

  play(): void {
    this.send('play');
  }

  pause(): void {
    this.send('pause');
  }

  seek(time: number): void {
    this.send('seek', Math.max(0, time));
  }

  setVolume(volume: number): void {
    this.send('volume', Math.min(1, Math.max(0, volume)));
  }

  mute(): void {
    this.send('mute');
  }

  unmute(): void {
    this.send('unmute');
  }

  enterFullscreen(): void {
    this.send('fullscreen');
  }

  exitFullscreen(): void {
    this.send('exitFullscreen');
  }

  // ── State ──────────────────────────────────────────────

  getState(): Readonly<PlayerState> {
    return { ...this.state };
  }

  isReady():    boolean { return this.state.ready; }
  isPlaying():  boolean { return this.state.playing; }
  isMuted():    boolean { return this.state.muted; }

  getCurrentTime(): number { return this.state.currentTime; }
  getDuration():    number { return this.state.duration; }

  // ── Event API ──────────────────────────────────────────
  // All return `this` for chaining:
  // player.on('play', ...).on('ended', ...)

  on<K extends keyof PlayerEventMap>(
    event:   K,
    handler: (data: PlayerEventMap[K]) => void,
  ): this {
    this.emitter.on(event, handler);
    return this;
  }

  off<K extends keyof PlayerEventMap>(
    event:   K,
    handler: (data: PlayerEventMap[K]) => void,
  ): this {
    this.emitter.off(event, handler);
    return this;
  }

  once<K extends keyof PlayerEventMap>(
    event:   K,
    handler: (data: PlayerEventMap[K]) => void,
  ): this {
    this.emitter.once(event, handler);
    return this;
  }

  // ── Destroy ────────────────────────────────────────────

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    window.removeEventListener('message', this.msgHandler);

    if (this.wrapper) {
      destroyIframe(this.wrapper);
      this.wrapper = null;
      this.iframe  = null;
    }

    this.emitter.removeAll();
  }

  // ── Private: send command to iframe ───────────────────

  private send(action: IframeAction, value?: unknown): void {
    if (this.destroyed) return;
    if (!this.iframe?.contentWindow) return;

    const cmd: IframeCommand = {
      action,
      videoId: this.opts.videoId,
      value,
    };

    this.iframe.contentWindow.postMessage(cmd, '*');
  }

  // ── Private: handle incoming postMessage ──────────────

  private handleMessage(e: MessageEvent): void {
    const msg = e.data as IframeMessage;

    // Ignore non-SDK messages
    if (!msg || msg.type !== 'videncrypt:player') return;

    // Ignore messages for other player instances on same page
    if (msg.videoId !== this.opts.videoId) return;

    switch (msg.event) {
      case 'ready':
        this.state.ready = true;
        this.emitter.emit('ready', undefined as unknown as void);
        break;

      case 'play':
        this.state.playing = true;
        this.emitter.emit('play', undefined as unknown as void);
        break;

      case 'pause':
        this.state.playing = false;
        this.emitter.emit('pause', undefined as unknown as void);
        break;

      case 'ended':
        this.state.playing = false;
        this.emitter.emit('ended', undefined as unknown as void);
        break;

      case 'progress': {
        const currentTime = (msg.data?.currentTime as number) ?? 0;
        const duration    = (msg.data?.duration    as number) ?? 0;
        this.state.currentTime = currentTime;
        this.state.duration    = duration;
        this.emitter.emit('progress', { currentTime, duration });
        break;
      }

      case 'error': {
        const error: PlayerError = {
          code:    (msg.data?.code    as PlayerError['code']) ?? 'unknown',
          message: (msg.data?.message as string)              ?? 'Unknown error',
        };
        this.emitter.emit('error', error);
        break;
      }

      case 'fullscreenchange': {
        const isFullscreen = (msg.data?.isFullscreen as boolean) ?? false;
        this.state.fullscreen = isFullscreen;
        this.emitter.emit('fullscreenchange', isFullscreen);
        break;
      }

      case 'statechange': {
        const partial = (msg.data ?? {}) as Partial<PlayerState>;
        this.state = { ...this.state, ...partial };
        this.emitter.emit('statechange', partial);
        break;
      }
    }
  }
}