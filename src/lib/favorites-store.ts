/**
 * Simple event-based store for favorites state
 * Allows components to subscribe to favorite changes
 */

type Listener = (slug: string, action: 'add' | 'remove') => void;

const listeners = new Set<Listener>();

export function subscribeFavoriteChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitFavoriteChange(slug: string, action: 'add' | 'remove') {
  listeners.forEach(listener => listener(slug, action));
}
