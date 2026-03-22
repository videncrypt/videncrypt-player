// ── Aspect ratio ───────────────────────────────────────────

export function parseAspectRatio(ratio: string): { w: number; h: number } {
  const parts = ratio.split('/').map(Number);
  const w = parts[0];
  const h = parts[1];
  if (!w || !h || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
    return { w: 16, h: 9 };
  }
  return { w, h };
}

// '16/9'  → '56.2500%'
// '4/3'   → '75.0000%'
// '1/1'   → '100.0000%'
export function aspectRatioToPadding(ratio: string): string {
  const { w, h } = parseAspectRatio(ratio);
  return `${((h / w) * 100).toFixed(4)}%`;
}

// ── Width normalisation ────────────────────────────────────

// 640       → '640px'
// '640px'   → '640px'
// '100%'    → '100%'
// undefined → '100%'
export function normalizeWidth(width?: string | number): string {
  if (width === undefined || width === null) return '100%';
  if (typeof width === 'number') return `${width}px`;
  return width;
}

// ── ID generation ──────────────────────────────────────────

// Generates a short unique ID for internal use.
// Format: 've_' + 8 random alphanumeric chars → 've_a3f9k2m1'
export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 've_';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ── Validation ─────────────────────────────────────────────

export function isValidVideoId(id: unknown): id is string {
  return typeof id === 'string' && id.trim().length > 0;
}
