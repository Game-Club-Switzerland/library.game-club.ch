const pickButton = GameLibrary.qs('[data-random-pick]');
const resultWrap = GameLibrary.qs('[data-random-result]');
const genreSelect = GameLibrary.qs('[data-random-genre]');
const playersSelect = GameLibrary.qs('[data-random-players]');

let allGames = [];

const applyRandom = () => {
  const genre = genreSelect.value;
  const players = playersSelect.value;

  const filtered = allGames.filter((game) => {
    if (genre && !game.genres.includes(genre)) return false;
    if (players) {
      const min = game.players?.min ?? 1;
      const max = game.players?.max ?? min;
      if (players === '1' && min > 1) return false;
      if (players === '2' && max < 2) return false;
      if (players === '3-4' && max < 3) return false;
      if (players === '5+' && max < 5) return false;
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
          ${game.tags.slice(0, 4).map((tag) => `<span class="badge">${tag}</span>`).join('')}
        </div>
      </div>
    </a>
  `;
};

const initFilters = (games) => {
  const genres = new Set();
  games.forEach((game) => {
    game.genres.forEach((genre) => genres.add(genre));
  });

  genreSelect.innerHTML = '<option value="">Alle Genres</option>';
  Array.from(genres).sort().forEach((genre) => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreSelect.appendChild(option);
  });
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
