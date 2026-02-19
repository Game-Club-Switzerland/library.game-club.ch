const pickButton = GameLibrary.qs('[data-random-pick]');
const resultWrap = GameLibrary.qs('[data-random-result]');
const genreSelect = GameLibrary.qs('[data-random-genre]');
const playersSelect = GameLibrary.qs('[data-random-players]');
const categoriesWrap = GameLibrary.qs('[data-random-categories]');
const tagsWrap = GameLibrary.qs('[data-random-tags]');
const FILTER_OPTION_LIMIT = 10;
const expandedFilterOptions = {
  categories: false,
  tags: false,
};

let allGames = [];

const getCheckedValues = (wrap) =>
  GameLibrary.qsa('input[type="checkbox"]:checked', wrap).map((input) => input.value);

const renderFilterOptions = (wrap, values, key, emptyText) => {
  if (!wrap) return;

  const selectedValues = new Set(getCheckedValues(wrap));
  const isExpanded = expandedFilterOptions[key];
  const visibleValues =
    !isExpanded && values.length > FILTER_OPTION_LIMIT
      ? values.slice(0, FILTER_OPTION_LIMIT)
      : values;

  wrap.innerHTML = '';
  if (!values.length) {
    wrap.innerHTML = `<span class="badge">${emptyText}</span>`;
    return;
  }

  visibleValues.forEach((value) => {
    const label = document.createElement('label');
    label.className = 'badge filter-option';
    label.style.cursor = 'pointer';
    label.style.display = 'block';
    label.style.width = '100%';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = value;
    input.checked = selectedValues.has(value);
    input.style.display = 'none';

    if (input.checked) {
      label.classList.add('selected');
    }

    label.appendChild(input);
    label.append(value);
    wrap.appendChild(label);

    label.addEventListener('click', (e) => {
      e.preventDefault();
      input.checked = !input.checked;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      label.classList.toggle('selected', input.checked);
    });
  });

  if (values.length > FILTER_OPTION_LIMIT) {
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'filter-toggle-button';
    toggleButton.textContent = isExpanded ? 'Weniger anzeigen' : 'Mehr anzeigen';
    toggleButton.addEventListener('click', () => {
      expandedFilterOptions[key] = !expandedFilterOptions[key];
      renderFilterOptions(wrap, values, key, emptyText);
    });
    wrap.appendChild(toggleButton);
  }
};

const renderCategories = (categories) => {
  renderFilterOptions(categoriesWrap, categories, 'categories', 'Keine Kategorien verfügbar');
};

const renderTags = (tags) => {
  renderFilterOptions(tagsWrap, tags, 'tags', 'Keine Tags verfügbar');
};

const applyRandom = () => {
  const genre = genreSelect.value;
  const players = playersSelect.value;
  const selectedCategories = categoriesWrap
    ? GameLibrary.qsa('input[type="checkbox"]:checked', categoriesWrap).map((input) => input.value)
    : [];
  const selectedTags = tagsWrap
    ? GameLibrary.qsa('input[type="checkbox"]:checked', tagsWrap).map((input) => input.value)
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
        <div class="badges" style="margin-top:8px">
          ${(game.tags ?? []).slice(0, 4).map((tag) => `<span class="badge">${tag}</span>`).join('')}
        </div>
      </div>
    </a>
  `;
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
