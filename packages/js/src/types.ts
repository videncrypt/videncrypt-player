// ── Player options ─────────────────────────────────────────

export interface PlayerOptions {
  // Required
  videoId:    string;
  container:  string | HTMLElement;

  // Display
  width?:       string | number;   // default: '100%'
  aspectRatio?: string;            // default: '16/9'
  title?:       string;

  // Playback
  autoPlay?:  boolean;             // default: false
  muted?:     boolean;             // default: false
  loop?:      boolean;             // default: false
  startTime?: number;              // start at N seconds

  // UI
  showControls?: boolean;          // default: true
  showBranding?: boolean;          // default: true
  primaryColor?: string;           // hex color e.g. '#2563EB'

  // Callbacks — alternative to .on()
  onReady?:            () => void;
  onPlay?:             () => void;
  onPause?:            () => void;
  onEnded?:            () => void;
  onProgress?:         (currentTime: number, duration: number) => void;
  onError?:            (error: PlayerError) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;

  // Override embed base URL (staging / self-hosted)
  embedBaseUrl?: string;           // default: 'https://app.videncrypt.com'
}

// ── Player state ───────────────────────────────────────────

export interface PlayerState {
  playing:     boolean;
  muted:       boolean;
  currentTime: number;
  duration:    number;
  fullscreen:  boolean;
  ready:       boolean;
}

// ── Errors ─────────────────────────────────────────────────

export interface PlayerError {
  code:    'token-expired'
         | 'not-found'
         | 'domain-not-allowed'
         | 'network-error'
         | 'unknown';
  message: string;
}

// ── Event map ──────────────────────────────────────────────
// Maps event name → payload type.
// void = event has no payload.

export interface PlayerEventMap {
  // Index signature required for EventEmitter<PlayerEventMap> constraint
  [key: string]: unknown;
  ready:            void;
  play:             void;
  pause:            void;
  ended:            void;
  progress:         { currentTime: number; duration: number };
  error:            PlayerError;
  fullscreenchange: boolean;
  statechange:      Partial<PlayerState>;
}

// ── postMessage protocol ───────────────────────────────────
// Messages FROM iframe TO SDK

export interface IframeMessage {
  type:     'videncrypt:player';
  videoId:  string;
  event:    IframeEvent;
  data?:    Record<string, unknown>;
}

export type IframeEvent =
  | 'ready'
  | 'play'
  | 'pause'
  | 'ended'
  | 'progress'
  | 'error'
  | 'fullscreenchange'
  | 'statechange';

// Commands FROM SDK TO iframe

export interface IframeCommand {
  action:  IframeAction;
  videoId: string;
  value?:  unknown;
}

export type IframeAction =
  | 'play'
  | 'pause'
  | 'seek'
  | 'volume'
  | 'mute'
  | 'unmute'
  | 'fullscreen'
  | 'exitFullscreen';