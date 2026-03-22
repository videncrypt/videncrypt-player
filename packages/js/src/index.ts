// Named export for npm / ESM usage:
//   import { Player } from '@videncrypt/js'
export { VidEncryptPlayer as Player } from './player';

// Type exports
export type {
  PlayerOptions,
  PlayerState,
  PlayerError,
  PlayerEventMap,
  IframeMessage,
  IframeCommand,
  IframeEvent,
  IframeAction,
} from './types';

// When built as IIFE for CDN, tsup sets globalName: 'VidEncrypt'
// so window.VidEncrypt.Player is available after the script tag.
