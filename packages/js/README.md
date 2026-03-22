# @videncrypt/js

JavaScript SDK for embedding secure VidEncrypt videos on any website.
Works with plain HTML, Vue, Angular, Svelte, or any framework.

## Installation

### npm
```bash
npm install @videncrypt/js
```

### CDN (script tag)
```html
<script src="https://cdn.videncrypt.com/sdk/ve.js"></script>
```

---

## Quick start — script tag

```html
<div id="player"></div>
<script src="https://cdn.videncrypt.com/sdk/ve.js"></script>
<script>
  const player = new VidEncrypt.Player({
    videoId:   'YOUR_VIDEO_ID',
    container: '#player',
    onPlay:    () => console.log('playing'),
    onEnded:   () => console.log('ended'),
  });
</script>
```

## Quick start — npm / ESM

```javascript
import { Player } from '@videncrypt/js';

const player = new Player({
  videoId:   'YOUR_VIDEO_ID',
  container: '#player',
});

player.on('ready', () => console.log('ready'));
player.on('play',  () => console.log('playing'));
```

---

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `videoId` | `string` | **required** | Video ID from your VidEncrypt dashboard |
| `container` | `string \| HTMLElement` | **required** | CSS selector or DOM element |
| `width` | `string \| number` | `'100%'` | Player width |
| `aspectRatio` | `string` | `'16/9'` | Aspect ratio e.g. `'4/3'`, `'1/1'` |
| `title` | `string` | `''` | Player iframe title (accessibility) |
| `autoPlay` | `boolean` | `false` | Auto-play on load (requires `muted: true` in most browsers) |
| `muted` | `boolean` | `false` | Start muted |
| `loop` | `boolean` | `false` | Loop video |
| `startTime` | `number` | `0` | Start playback at N seconds |
| `showControls` | `boolean` | `true` | Show player controls |
| `showBranding` | `boolean` | `true` | Show VidEncrypt branding badge |
| `primaryColor` | `string` | `'#2563EB'` | Accent color (hex) |
| `embedBaseUrl` | `string` | `'https://app.videncrypt.com'` | Override for self-hosted |
| `onReady` | `() => void` | — | Player is ready |
| `onPlay` | `() => void` | — | Playback started |
| `onPause` | `() => void` | — | Playback paused |
| `onEnded` | `() => void` | — | Video ended |
| `onProgress` | `(currentTime, duration) => void` | — | Playback position update |
| `onError` | `(error: PlayerError) => void` | — | Playback error |
| `onFullscreenChange` | `(isFullscreen: boolean) => void` | — | Fullscreen toggled |

---

## Methods

| Method | Returns | Description |
|---|---|---|
| `play()` | `void` | Start playback |
| `pause()` | `void` | Pause playback |
| `seek(time)` | `void` | Seek to time in seconds |
| `setVolume(volume)` | `void` | Set volume 0–1 |
| `mute()` | `void` | Mute audio |
| `unmute()` | `void` | Unmute audio |
| `enterFullscreen()` | `void` | Enter fullscreen |
| `exitFullscreen()` | `void` | Exit fullscreen |
| `getState()` | `PlayerState` | Get current player state (readonly copy) |
| `isReady()` | `boolean` | Returns true after player is ready |
| `isPlaying()` | `boolean` | Returns true while playing |
| `isMuted()` | `boolean` | Returns true while muted |
| `getCurrentTime()` | `number` | Current playback position in seconds |
| `getDuration()` | `number` | Total video duration in seconds |
| `on(event, handler)` | `this` | Add event listener (chainable) |
| `off(event, handler)` | `this` | Remove event listener |
| `once(event, handler)` | `this` | Add one-time event listener |
| `destroy()` | `void` | Remove player from DOM and clean up |

---

## Events

| Event | Payload | Description |
|---|---|---|
| `ready` | — | Player initialized and ready |
| `play` | — | Playback started or resumed |
| `pause` | — | Playback paused |
| `ended` | — | Video reached the end |
| `progress` | `{ currentTime: number, duration: number }` | Fires every ~5 seconds while playing |
| `error` | `PlayerError` | Playback or network error |
| `fullscreenchange` | `boolean` | Fullscreen state changed |
| `statechange` | `Partial<PlayerState>` | Any state property changed |

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

### Vue 3

```javascript
import { onMounted, onUnmounted } from 'vue';
import { Player } from '@videncrypt/js';

export default {
  setup() {
    let player = null;

    onMounted(() => {
      player = new Player({
        videoId:   'YOUR_VIDEO_ID',
        container: '#player',
      });
    });

    onUnmounted(() => player?.destroy());
  }
}
```

### Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Player } from '@videncrypt/js';

@Component({
  selector: 'app-video',
  template: '<div id="player"></div>',
})
export class VideoComponent implements OnInit, OnDestroy {
  private player: InstanceType<typeof Player>;

  ngOnInit() {
    this.player = new Player({
      videoId:   'YOUR_VIDEO_ID',
      container: '#player',
    });
  }

  ngOnDestroy() {
    this.player.destroy();
  }
}
```

### Svelte

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { Player } from '@videncrypt/js';

  let player;

  onMount(() => {
    player = new Player({
      videoId:   'YOUR_VIDEO_ID',
      container: '#player',
    });
  });

  onDestroy(() => player?.destroy());
</script>

<div id="player"></div>
```

---

## Multiple players on one page

Each player filters postMessage events by `videoId` so multiple
instances never interfere with each other.

```javascript
const player1 = new Player({ videoId: 'video-aaa', container: '#player1' });
const player2 = new Player({ videoId: 'video-bbb', container: '#player2' });

// Events on player1 never fire on player2 and vice versa
player1.on('play', () => console.log('player1 playing'));
player2.on('play', () => console.log('player2 playing'));
```

---

## Cleanup

Always call `destroy()` when removing the player to prevent memory
leaks and stop ongoing network requests.

```javascript
// React
useEffect(() => {
  const player = new Player({ videoId, container: '#player' });
  return () => player.destroy();
}, [videoId]);

// Plain JS
window.addEventListener('beforeunload', () => player.destroy());
```
