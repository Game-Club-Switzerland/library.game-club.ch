const GameLibrary = (() => {
  const API_BASE = './api';

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const formatPlayers = (players) => {
    if (!players) return '-';
    const min = players.min ?? 1;
    const max = players.max ?? min;
    if (min === max) return `${min} Player`;
    return `${min}-${max} Player`;
  };

  const sortByNewest = (games) => {
    return [...games].sort((a, b) => {
      const aDate = new Date(a.addedAt || a.updatedAt || 0).getTime();
      const bDate = new Date(b.addedAt || b.updatedAt || 0).getTime();
      return bDate - aDate;
    });
  };

  const fetchJson = async (path) => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}`);
    }
    return response.json();
  };

  const fetchGames = () => fetchJson(`${API_BASE}/games.json`);

  const fetchGame = (id) => fetchJson(`${API_BASE}/game/${id}.json`);

  return {
    qs,
    qsa,
    formatPlayers,
    sortByNewest,
    fetchGames,
    fetchGame,
  };
})();
