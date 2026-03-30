import { useState, useCallback } from "react";

type FavoriteType = "processos" | "tarefas";

function getKey(type: FavoriteType) {
  return `vigora_favoritos_${type}`;
}

function loadFavorites(type: FavoriteType): Set<number> {
  try {
    const raw = localStorage.getItem(getKey(type));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function saveFavorites(type: FavoriteType, ids: Set<number>) {
  localStorage.setItem(getKey(type), JSON.stringify([...ids]));
}

export function useFavorites(type: FavoriteType) {
  const [favorites, setFavorites] = useState<Set<number>>(() => loadFavorites(type));

  const toggle = useCallback((id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveFavorites(type, next);
      return next;
    });
  }, [type]);

  const isFavorite = useCallback((id: number) => favorites.has(id), [favorites]);

  return { favorites, toggle, isFavorite };
}
