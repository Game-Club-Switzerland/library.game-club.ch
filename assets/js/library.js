const listBody = GameLibrary.qs('[data-library-body]');
const searchInput = GameLibrary.qs('[data-search]');
const genreSelect = GameLibrary.qs('[data-genre]');
const playersSelect = GameLibrary.qs('[data-players]');
const tagsWrap = GameLibrary.qs('[data-tags]');

let allGames = [];

const normalize = (value) => value.toLowerCase();

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

const renderRows = (games) => {
  listBody.innerHTML = '';
  games.forEach((game) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div class="icon-cell">
          <img src="${game.media.icon}" alt="${game.name} icon" />
          <a href="game.html?id=${encodeURIComponent(game.id)}">${game.name}</a>
        </div>
      </td>
      <td>${game.genres.join(', ')}</td>
      <td>${GameLibrary.formatPlayers(game.players)}</td>
      <td>${game.tags.slice(0, 4).join(', ')}</td>
      <td>${game.updatedAt}</td>
    `;
    listBody.appendChild(row);
  });
};

const applyFilters = () => {
  const term = normalize(searchInput.value.trim());
  const genre = genreSelect.value;
  const players = playersSelect.value;
  const selectedTags = GameLibrary.qsa('input[type="checkbox"]:checked', tagsWrap).map((input) => input.value);

  let result = allGames.filter((game) => {
    if (term && !normalize(game.name).includes(term)) return false;
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

  renderRows(result);
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

  [searchInput, genreSelect, playersSelect].forEach((el) => {
    el.addEventListener('input', applyFilters);
    el.addEventListener('change', applyFilters);
  });

  tagsWrap.addEventListener('change', applyFilters);
};

GameLibrary.fetchGames()
  .then((games) => {
    allGames = games;
    initFilters(games);
    renderRows(games);
  })
  .catch((error) => {
    listBody.innerHTML = `<tr><td colspan="5">${error.message}</td></tr>`;
  });
