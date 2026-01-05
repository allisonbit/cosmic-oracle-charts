import { useState, useEffect, useCallback } from "react";

const FAVORITES_KEY = "oracle_bull_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load favorites:", e);
    }
  }, []);

  // Save to localStorage whenever favorites change
  const saveFavorites = useCallback((newFavorites: string[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (e) {
      console.error("Failed to save favorites:", e);
    }
  }, []);

  const toggleFavorite = useCallback((coinSymbol: string) => {
    setFavorites(prev => {
      const normalized = coinSymbol.toUpperCase();
      const newFavorites = prev.includes(normalized)
        ? prev.filter(s => s !== normalized)
        : [...prev, normalized];
      
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      } catch (e) {
        console.error("Failed to save favorites:", e);
      }
      
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((coinSymbol: string) => {
    return favorites.includes(coinSymbol.toUpperCase());
  }, [favorites]);

  const addFavorite = useCallback((coinSymbol: string) => {
    const normalized = coinSymbol.toUpperCase();
    if (!favorites.includes(normalized)) {
      saveFavorites([...favorites, normalized]);
    }
  }, [favorites, saveFavorites]);

  const removeFavorite = useCallback((coinSymbol: string) => {
    const normalized = coinSymbol.toUpperCase();
    saveFavorites(favorites.filter(s => s !== normalized));
  }, [favorites, saveFavorites]);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
  };
}
