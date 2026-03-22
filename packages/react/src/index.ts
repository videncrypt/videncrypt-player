// Main component
export { VidEncryptPlayer } from './player';
export type { VidEncryptPlayerProps } from './player';

// Hook for custom implementations
export { usePlayer } from './use-player';
export type { UsePlayerOptions, UsePlayerReturn } from './use-player';

// Re-export types from @videncrypt/js so consumers
// only need to import from @videncrypt/react
export type {
  PlayerOptions,
  PlayerState,
  PlayerError,
  PlayerEventMap,
} from '@videncrypt/js';