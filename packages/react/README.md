# @videncrypt/react

React component and hook for embedding secure VidEncrypt videos.

## Installation

```bash
npm install @videncrypt/react
```

> `@videncrypt/js` is installed automatically as a dependency.

---

## Quick start

```tsx
import { VidEncryptPlayer } from '@videncrypt/react';

export default function Page() {
  return (
    <VidEncryptPlayer
      videoId="YOUR_VIDEO_ID"
      onPlay={() => console.log('playing')}
      onEnded={() => console.log('ended')}
    />
  );
}
```

---

## VidEncryptPlayer

The main component. Renders the player inside a responsive container with built-in loading and error states.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `videoId` | `string` | **required** | Video ID from your VidEncrypt dashboard |
| `width` | `string \| number` | `'100%'` | Player width |
| `aspectRatio` | `string` | `'16/9'` | Aspect ratio e.g. `'4/3'`, `'1/1'` |
| `title` | `string` | `''` | iframe title (accessibility) |
| `autoPlay` | `boolean` | `false` | Auto-play on load (requires `muted: true` in most browsers) |
| `muted` | `boolean` | `false` | Start muted |
| `loop` | `boolean` | `false` | Loop video |
| `startTime` | `number` | `0` | Start at N seconds |
| `showControls` | `boolean` | `true` | Show player controls |
| `showBranding` | `boolean` | `true` | Show VidEncrypt badge |
| `primaryColor` | `string` | `'#2563EB'` | Accent color (hex) |
| `embedBaseUrl` | `string` | `'https://app.videncrypt.com'` | Override for staging |
| `className` | `string` | — | CSS class on the wrapper div |
| `style` | `CSSProperties` | — | Inline style on the wrapper div |
| `loadingSlot` | `ReactNode` | built-in spinner | Custom loading state |
| `errorSlot` | `(error) => ReactNode` | built-in error UI | Custom error state |
| `onReady` | `() => void` | — | Player initialized |
| `onPlay` | `() => void` | — | Playback started |
| `onPause` | `() => void` | — | Playback paused |
| `onEnded` | `() => void` | — | Video ended |
| `onProgress` | `(currentTime, duration) => void` | — | Position update (~5s interval) |
| `onError` | `(error: PlayerError) => void` | — | Playback error |
| `onFullscreenChange` | `(isFullscreen: boolean) => void` | — | Fullscreen toggled |

### Examples

**Custom aspect ratio:**
```tsx
<VidEncryptPlayer
  videoId="YOUR_VIDEO_ID"
  aspectRatio="4/3"
  width={640}
/>
```

**Autoplay muted:**
```tsx
<VidEncryptPlayer
  videoId="YOUR_VIDEO_ID"
  autoPlay
  muted
/>
```

**Custom loading and error states:**
```tsx
<VidEncryptPlayer
  videoId="YOUR_VIDEO_ID"
  loadingSlot={<MySpinner />}
  errorSlot={(error) => (
    <div className="error">
      {error.message} ({error.code})
    </div>
  )}
/>
```

**Custom accent color:**
```tsx
<VidEncryptPlayer
  videoId="YOUR_VIDEO_ID"
  primaryColor="#7C3AED"
/>
```

---

## usePlayer hook

For full control over the player with your own UI.

```tsx
import { usePlayer } from '@videncrypt/react';

function CustomPlayer({ videoId }: { videoId: string }) {
  const {
    containerRef,
    playing,
    state,
    play,
    pause,
    seek,
    setVolume,
  } = usePlayer({ videoId });

  return (
    <div>
      {/* Player mounts here */}
      <div ref={containerRef} />

      {/* Custom controls */}
      <button onClick={playing ? pause : play}>
        {playing ? 'Pause' : 'Play'}
      </button>

      <button onClick={() => seek(30)}>
        Skip to 30s
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.1}
        onChange={(e) => setVolume(Number(e.target.value))}
      />

      <p>
        {state.currentTime.toFixed(0)}s / {state.duration.toFixed(0)}s
      </p>
    </div>
  );
}
```

### Hook return values

| Value | Type | Description |
|---|---|---|
| `containerRef` | `RefObject<HTMLDivElement>` | Attach to your container div |
| `state` | `PlayerState` | Full player state snapshot |
| `ready` | `boolean` | True after player initializes |
| `playing` | `boolean` | True while playing |
| `error` | `PlayerError \| null` | Current error or null |
| `play()` | `() => void` | Start playback |
| `pause()` | `() => void` | Pause playback |
| `seek(time)` | `(number) => void` | Seek to seconds |
| `setVolume(v)` | `(number) => void` | Set volume 0–1 |
| `mute()` | `() => void` | Mute audio |
| `unmute()` | `() => void` | Unmute audio |
| `enterFullscreen()` | `() => void` | Enter fullscreen |
| `exitFullscreen()` | `() => void` | Exit fullscreen |

### PlayerState

```typescript
interface PlayerState {
  playing:     boolean;
  muted:       boolean;
  currentTime: number;
  duration:    number;
  fullscreen:  boolean;
  ready:       boolean;
}
```

### PlayerError

```typescript
interface PlayerError {
  code:    'token-expired' | 'not-found' | 'domain-not-allowed'
         | 'network-error' | 'unknown';
  message: string;
}
```

---

## Framework examples

### Next.js App Router

```tsx
// app/watch/[id]/page.tsx
import { VidEncryptPlayer } from '@videncrypt/react';

export default function WatchPage({ params }: { params: { id: string } }) {
  return (
    <main className="max-w-4xl mx-auto p-6">
      <VidEncryptPlayer videoId={params.id} />
    </main>
  );
}
```

### Next.js with progress tracking

```tsx
'use client';

import { VidEncryptPlayer } from '@videncrypt/react';
import { useState } from 'react';

export default function VideoPage({ videoId }: { videoId: string }) {
  const [progress, setProgress] = useState(0);

  return (
    <div>
      <VidEncryptPlayer
        videoId={videoId}
        onProgress={(currentTime, duration) => {
          setProgress(Math.round((currentTime / duration) * 100));
        }}
      />
      <p>{progress}% watched</p>
    </div>
  );
}
```

### Pause other videos when one plays

```tsx
'use client';

import { usePlayer } from '@videncrypt/react';

const VIDEO_IDS = ['video-aaa', 'video-bbb', 'video-ccc'];

export default function VideoList() {
  const players = VIDEO_IDS.map((id) =>
    usePlayer({
      videoId: id,
      onPlay: () => {
        // pause all others when this one plays
        players.forEach((p, i) => {
          if (VIDEO_IDS[i] !== id) p.pause();
        });
      },
    })
  );

  return (
    <div className="grid grid-cols-3 gap-4">
      {players.map((player, i) => (
        <div key={VIDEO_IDS[i]} ref={player.containerRef} />
      ))}
    </div>
  );
}
```

---

## TypeScript

All types are exported from `@videncrypt/react` — no need to import from `@videncrypt/js` separately.

```typescript
import type {
  PlayerOptions,
  PlayerState,
  PlayerError,
  VidEncryptPlayerProps,
  UsePlayerOptions,
  UsePlayerReturn,
} from '@videncrypt/react';
```