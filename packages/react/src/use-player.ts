import { useEffect, useRef, useState, useCallback } from 'react';
import { Player } from '@videncrypt/js';
import type { PlayerOptions, PlayerState, PlayerError } from '@videncrypt/js';

// ── usePlayer hook ─────────────────────────────────────────
// Creates and manages a VidEncryptPlayer instance.
// Handles lifecycle — creates on mount, destroys on unmount.
// Re-creates when videoId changes.

export interface UsePlayerOptions
  extends Omit<PlayerOptions, 'container'> {
  // container is handled by the component via ref
}

export interface UsePlayerReturn {
  // Attach this ref to the container div
  containerRef: React.RefObject<HTMLDivElement | null>;

  // Current player state
  state:   PlayerState;
  ready:   boolean;
  playing: boolean;
  error:   PlayerError | null;

  // Playback controls
  play:             () => void;
  pause:            () => void;
  seek:             (time: number) => void;
  setVolume:        (volume: number) => void;
  mute:             () => void;
  unmute:           () => void;
  enterFullscreen:  () => void;
  exitFullscreen:   () => void;
}

export function usePlayer(options: UsePlayerOptions): UsePlayerReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef    = useRef<InstanceType<typeof Player> | null>(null);

  const [state, setState] = useState<PlayerState>({
    playing:     false,
    muted:       options.muted    ?? false,
    currentTime: options.startTime ?? 0,
    duration:    0,
    fullscreen:  false,
    ready:       false,
  });

  const [error, setError] = useState<PlayerError | null>(null);

  // Stable options ref — avoids recreating player on every render
  // when callbacks are inline arrow functions
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Destroy previous instance if videoId changed
    playerRef.current?.destroy();
    setError(null);

    const player = new Player({
      ...optsRef.current,
      container,

      onReady: () => {
        setState((s) => ({ ...s, ready: true }));
        optsRef.current.onReady?.();
      },
      onPlay: () => {
        setState((s) => ({ ...s, playing: true }));
        optsRef.current.onPlay?.();
      },
      onPause: () => {
        setState((s) => ({ ...s, playing: false }));
        optsRef.current.onPause?.();
      },
      onEnded: () => {
        setState((s) => ({ ...s, playing: false }));
        optsRef.current.onEnded?.();
      },
      onProgress: (currentTime, duration) => {
        setState((s) => ({ ...s, currentTime, duration }));
        optsRef.current.onProgress?.(currentTime, duration);
      },
      onError: (e) => {
        setError(e);
        optsRef.current.onError?.(e);
      },
      onFullscreenChange: (isFullscreen) => {
        setState((s) => ({ ...s, fullscreen: isFullscreen }));
        optsRef.current.onFullscreenChange?.(isFullscreen);
      },
    });

    playerRef.current = player;

    return () => {
      player.destroy();
      playerRef.current = null;
    };
  }, [options.videoId]); // only re-create when videoId changes

  // ── Stable control functions ───────────────────────────
  // useCallback with empty deps — these never change,
  // they just call the current player ref

  const play            = useCallback(() => playerRef.current?.play(),                    []);
  const pause           = useCallback(() => playerRef.current?.pause(),                   []);
  const seek            = useCallback((t: number) => playerRef.current?.seek(t),          []);
  const setVolume       = useCallback((v: number) => playerRef.current?.setVolume(v),     []);
  const mute            = useCallback(() => playerRef.current?.mute(),                    []);
  const unmute          = useCallback(() => playerRef.current?.unmute(),                  []);
  const enterFullscreen = useCallback(() => playerRef.current?.enterFullscreen(),         []);
  const exitFullscreen  = useCallback(() => playerRef.current?.exitFullscreen(),          []);

  return {
    containerRef,
    state,
    ready:   state.ready,
    playing: state.playing,
    error,
    play,
    pause,
    seek,
    setVolume,
    mute,
    unmute,
    enterFullscreen,
    exitFullscreen,
  };
}