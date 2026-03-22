import type { PlayerOptions } from './types';
import { aspectRatioToPadding, normalizeWidth } from './utils';

// ── createIframe ───────────────────────────────────────────

export function createIframe(opts: Required<PlayerOptions>): {
  iframe:  HTMLIFrameElement;
  wrapper: HTMLElement;
} {
  // ── Build embed URL ────────────────────────────────────
  const url = new URL(`${opts.embedBaseUrl}/embed/${opts.videoId}`);

  if (opts.autoPlay)              url.searchParams.set('autoplay',  '1');
  if (opts.muted)                 url.searchParams.set('muted',     '1');
  if (opts.loop)                  url.searchParams.set('loop',      '1');
  if (!opts.showControls)         url.searchParams.set('controls',  '0');
  if (!opts.showBranding)         url.searchParams.set('branding',  '0');
  if (opts.startTime && opts.startTime > 0) {
    url.searchParams.set('start', String(opts.startTime));
  }
  if (opts.primaryColor && opts.primaryColor !== '#2563EB') {
    url.searchParams.set('color', opts.primaryColor.replace('#', ''));
  }
  if (opts.title) {
    url.searchParams.set('title', encodeURIComponent(opts.title));
  }

  // ── Outer wrapper ──────────────────────────────────────
  const wrapper = document.createElement('div');
  wrapper.style.cssText = [
    'position: relative',
    `width: ${normalizeWidth(opts.width)}`,
    'background: #000',
    'line-height: 0',   // prevents gap below iframe
  ].join('; ');

  // ── Aspect ratio box ───────────────────────────────────
  // padding-bottom trick works in all browsers including
  // old Safari — no CSS aspect-ratio property needed
  const aspectBox = document.createElement('div');
  aspectBox.style.cssText = [
    'position: relative',
    `padding-bottom: ${aspectRatioToPadding(opts.aspectRatio)}`,
    'height: 0',
    'overflow: hidden',
  ].join('; ');

  // ── iframe ─────────────────────────────────────────────
  const iframe = document.createElement('iframe');

  iframe.src             = url.toString();
  iframe.title           = opts.title || 'Video Player';
  iframe.frameBorder     = '0';
  iframe.allowFullscreen = true;
  iframe.setAttribute('allow',
    'autoplay; fullscreen; picture-in-picture; clipboard-write',
  );
  iframe.setAttribute('loading', 'lazy');

  iframe.style.cssText = [
    'position: absolute',
    'top: 0',
    'left: 0',
    'width: 100%',
    'height: 100%',
    'border: none',
  ].join('; ');

  aspectBox.appendChild(iframe);
  wrapper.appendChild(aspectBox);

  return { iframe, wrapper };
}

// ── destroyIframe ──────────────────────────────────────────

export function destroyIframe(wrapper: HTMLElement): void {
  // Blank src first — stops any ongoing HLS segment downloads
  // and frees memory held by the iframe's JS context
  const iframe = wrapper.querySelector('iframe');
  if (iframe) {
    iframe.src = 'about:blank';
  }
  wrapper.remove();
}
