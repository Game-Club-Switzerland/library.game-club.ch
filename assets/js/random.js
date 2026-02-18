const pickButton = GameLibrary.qs('[data-random-pick]');
const resultWrap = GameLibrary.qs('[data-random-result]');
const genreSelect = GameLibrary.qs('[data-random-genre]');
const playersSelect = GameLibrary.qs('[data-random-players]');
const tagsWrap = GameLibrary.qs('[data-random-tags]');

let allGames = [];

const renderTags = (tags) => {
  tagsWrap.innerHTML = '';
  tags.forEach((tag) => {
    const label = document.createElement('label');
    label.className = 'badge';
    label.style.cursor = 'pointer';
    label.innerHTML = `
      <input type="checkbox" value="${tag}" style="margin-right:6px" />${tag}
    `;
    tagsWrap.appendChild(label);
  });
};

const applyRandom = () => {
  const genre = genreSelect.value;
  const players = playersSelect.value;
  const selectedTags = GameLibrary.qsa('input[type="checkbox"]:checked', tagsWrap).map((input) => input.value);

  const filtered = allGames.filter((game) => {
    if (genre && !game.genres.includes(genre)) return false;
    if (players) {
      const selectedPlayers = Number.parseInt(players, 10);
      const min = game.players?.min ?? 1;
      const max = game.players?.max ?? min;
      if (Number.isNaN(selectedPlayers)) return false;
      if (selectedPlayers < min || selectedPlayers > max) return false;
    }
    if (selectedTags.length) {
      return selectedTags.every((tag) => game.tags.includes(tag));
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
  const tags = new Set();
  games.forEach((game) => {
    game.genres.forEach((genre) => genres.add(genre));
    game.tags.forEach((tag) => tags.add(tag));
  });

  genreSelect.innerHTML = '<option value="">Alle Genres</option>';
  Array.from(genres).sort().forEach((genre) => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreSelect.appendChild(option);
  });

  renderTags(Array.from(tags).sort());
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
