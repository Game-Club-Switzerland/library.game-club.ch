const pickButton = GameLibrary.qs('[data-random-pick]');
const resultWrap = GameLibrary.qs('[data-random-result]');
const genreSelect = GameLibrary.qs('[data-random-genre]');
const playersSelect = GameLibrary.qs('[data-random-players]');
const categoriesWrap = GameLibrary.qs('[data-random-categories]');

let allGames = [];

const renderCategories = (categories) => {
  if (!categoriesWrap) return;
  categoriesWrap.innerHTML = '';
  if (!categories.length) {
    categoriesWrap.innerHTML = '<span class="badge">Keine Kategorien verfügbar</span>';
    return;
  }
  categories.forEach((category) => {
    const label = document.createElement('label');
    label.className = 'badge';
    label.style.cursor = 'pointer';
    label.innerHTML = `
      <input type="checkbox" value="${category}" style="margin-right:6px" />${category}
    `;
    categoriesWrap.appendChild(label);
  });
};

const applyRandom = () => {
  const genre = genreSelect.value;
  const players = playersSelect.value;
  const selectedCategories = categoriesWrap
    ? GameLibrary.qsa('input[type="checkbox"]:checked', categoriesWrap).map((input) => input.value)
    : [];

  const filtered = allGames.filter((game) => {
    if (genre && !game.genres.includes(genre)) return false;
    if (players) {
      const selectedPlayers = Number.parseInt(players, 10);
      const min = game.players?.min ?? 1;
      const max = game.players?.max ?? min;
      if (Number.isNaN(selectedPlayers)) return false;
      if (selectedPlayers < min || selectedPlayers > max) return false;
    }
    if (selectedCategories.length) {
      const gameCategories = game.categories ?? [];
      return selectedCategories.every((category) => gameCategories.includes(category));
    }
    return true;
  });

  if (!filtered.length) {
    resultWrap.innerHTML = '<div class="panel">Kein Game mit diesen Filtern.</div>';
    return;
  }

  const game = filtered[Math.floor(Math.random() * filtered.length)];
  resultWrap.innerHTML = `
    <a class="card" href="game.html?id=${encodeURIComponent(game.id)}">
      <img src="${game.media.cover}" alt="${game.name} cover" />
      <div class="card-body">
        <h4 class="card-title">${game.name}</h4>
        <div class="card-meta">${game.genres.join(' / ')}</div>
        <div class="badges">
          ${(game.categories ?? []).slice(0, 4).map((category) => `<span class="badge">${category}</span>`).join('')}
        </div>
      </div>
    </a>
  `;
};

const initFilters = (games) => {
  const genres = new Set();
  const categories = new Set();
  games.forEach((game) => {
    game.genres.forEach((genre) => genres.add(genre));
    (game.categories ?? []).forEach((category) => categories.add(category));
  });

  genreSelect.innerHTML = '<option value="">Alle Genres</option>';
  Array.from(genres).sort().forEach((genre) => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreSelect.appendChild(option);
  });

  renderCategories(Array.from(categories).sort());
};

GameLibrary.fetchGames()
  .then((games) => {
    allGames = games;
    initFilters(games);
    pickButton.addEventListener('click', applyRandom);
  })
  .catch((error) => {
    resultWrap.innerHTML = `<div class="panel">${error.message}</div>`;
  });
