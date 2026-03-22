'use client';

import { usePlayer, type UsePlayerOptions } from './use-player';
import type { PlayerError } from '@videncrypt/js';

// ── Props ──────────────────────────────────────────────────

export interface VidEncryptPlayerProps extends UsePlayerOptions {
  // Container sizing
  className?: string;
  style?:     React.CSSProperties;

  // Loading slot — shown while player initializes
  // Default: simple grey box
  loadingSlot?: React.ReactNode;

  // Error slot — shown on playback error
  // Default: error message + code
  errorSlot?: (error: PlayerError) => React.ReactNode;
}

// ── Component ──────────────────────────────────────────────

export function VidEncryptPlayer({
  className,
  style,
  loadingSlot,
  errorSlot,
  ...options
}: VidEncryptPlayerProps) {
  const { containerRef, ready, error } = usePlayer(options);

  return (
    <div
      style={{
        position:   'relative',
        width:      '100%',
        background: '#000',
        ...style,
      }}
      className={className}
    >
      {/* Player mounts here — always rendered so the ref is stable */}
      <div ref={containerRef} style={{ width: '100%' }} />

      {/* Loading overlay — shown until player is ready */}
      {!ready && !error && (
        <div style={overlayStyle}>
          {loadingSlot ?? <DefaultLoading />}
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div style={overlayStyle}>
          {errorSlot ? errorSlot(error) : <DefaultError error={error} />}
        </div>
      )}
    </div>
  );
}

// ── Default loading state ──────────────────────────────────

function DefaultLoading() {
  return (
    <div style={{
      position:        'absolute',
      inset:           0,
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      background:      '#000',
      pointerEvents:   'none',
    }}>
      <div style={{
        width:           32,
        height:          32,
        border:          '3px solid rgba(255,255,255,0.15)',
        borderTopColor:  '#2563EB',
        borderRadius:    '50%',
        animation:       've-spin 0.75s linear infinite',
      }} />
      <style>{`
        @keyframes ve-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Default error state ────────────────────────────────────

function DefaultError({ error }: { error: PlayerError }) {
  return (
    <div style={{
      position:       'absolute',
      inset:          0,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      background:     '#000',
      gap:            8,
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
        {error.message}
      </p>
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, margin: 0 }}>
        {error.code}
      </p>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset:    0,
};