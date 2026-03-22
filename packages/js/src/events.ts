type AnyHandler = (data: unknown) => void;

// The index signature makes EventMap compatible with Record<string, unknown>
// which TypeScript requires for generic constraints on Map keys
export type EventMapBase = { [key: string]: unknown };

export class EventEmitter<EventMap extends EventMapBase> {
  private handlers = new Map<keyof EventMap, Set<AnyHandler>>();

  on<K extends keyof EventMap>(
    event:   K,
    handler: (data: EventMap[K]) => void,
  ): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as AnyHandler);
  }

  off<K extends keyof EventMap>(
    event:   K,
    handler: (data: EventMap[K]) => void,
  ): void {
    this.handlers.get(event)?.delete(handler as AnyHandler);
  }

  once<K extends keyof EventMap>(
    event:   K,
    handler: (data: EventMap[K]) => void,
  ): void {
    const wrapper = (data: EventMap[K]) => {
      handler(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(data as unknown);
      } catch (err) {
        // A broken handler must never crash the player
        // or prevent other handlers from firing
        console.warn('[VidEncrypt] event handler error:', err);
      }
    });
  }

  removeAll(): void {
    this.handlers.clear();
  }
}