const listBody = GameLibrary.qs('[data-library-body]');
const searchInput = GameLibrary.qs('[data-search]');
const genreSelect = GameLibrary.qs('[data-genre]');
const playersSelect = GameLibrary.qs('[data-players]');
const categoriesWrap = GameLibrary.qs('[data-categories]');
const tagsWrap = GameLibrary.qs('[data-tags]');

let allGames = [];

const normalize = (value) => value.toLowerCase();

const renderCategories = (categories) => {
  categoriesWrap.innerHTML = '';
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
      <td>${(game.categories ?? []).slice(0, 4).join(', ')}</td>
      <td>${(game.tags ?? []).slice(0, 4).join(', ')}</td>
      <td>${game.updatedAt}</td>
    `;
    listBody.appendChild(row);
  });
};

const applyFilters = () => {
  const term = normalize(searchInput.value.trim());
  const genre = genreSelect.value;
  const players = playersSelect.value;
  const selectedCategories = GameLibrary.qsa('input[type="checkbox"]:checked', categoriesWrap).map((input) => input.value);
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
    if (selectedCategories.length) {
      const gameCategories = game.categories ?? [];
      if (!selectedCategories.every((category) => gameCategories.includes(category))) {
        return false;
      }
    }
    if (selectedTags.length) {
      const gameTags = game.tags ?? [];
      if (!selectedTags.every((tag) => gameTags.includes(tag))) {
        return false;
      }
    }
    return true;
  });

  renderRows(result);
};

const initFilters = (games) => {
  const genres = new Set();
  const categories = new Set();
  const tags = new Set();
  games.forEach((game) => {
    game.genres.forEach((genre) => genres.add(genre));
    (game.categories ?? []).forEach((category) => categories.add(category));
    (game.tags ?? []).forEach((tag) => tags.add(tag));
  });

  genreSelect.innerHTML = '<option value="">Alle Genres</option>';
  Array.from(genres).sort().forEach((genre) => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreSelect.appendChild(option);
  });

  renderCategories(Array.from(categories).sort());
  renderTags(Array.from(tags).sort());

  [searchInput, genreSelect, playersSelect].forEach((el) => {
    el.addEventListener('input', applyFilters);
    el.addEventListener('change', applyFilters);
  });

  categoriesWrap.addEventListener('change', applyFilters);
  tagsWrap.addEventListener('change', applyFilters);
};

GameLibrary.fetchGames()
  .then((games) => {
    allGames = games;
    initFilters(games);
    renderRows(games);
  })
  .catch((error) => {
    listBody.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
  });
