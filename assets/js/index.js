const latestList = GameLibrary.qs('[data-latest]');
const featuredCard = GameLibrary.qs('[data-featured]');

const renderCard = (game) => {
  const card = document.createElement('a');
  card.className = 'card fade-in';
  card.href = `game.html?id=${encodeURIComponent(game.id)}`;
  card.innerHTML = `
    <img src="${game.media.cover}" alt="${game.name} cover" loading="lazy" />
    <div class="card-body">
      <h4 class="card-title">${game.name}</h4>
      <div class="card-meta">${game.genres.join(' / ')}</div>
      <div class="badges">
        ${(game.categories ?? []).slice(0, 3).map((category) => `<span class="badge">${category}</span>`).join('')}
      </div>
    </div>
  `;
  return card;
};

GameLibrary.fetchGames()
  .then((games) => {
    const sorted = GameLibrary.sortByNewest(games);
    const latest = sorted.slice(0, 6);
    latest.forEach((game) => latestList.appendChild(renderCard(game)));

    if (sorted[0]) {
      const game = sorted[0];
      featuredCard.innerHTML = `
        <img src="${game.media.hero}" alt="${game.name} hero" />
        <div class="card-body">
          <h4 class="card-title">${game.name}</h4>
          <p class="card-meta">${game.description}</p>
          <div class="badges">
            ${(game.categories ?? []).slice(0, 4).map((category) => `<span class="badge">${category}</span>`).join('')}
          </div>
        </div>
      `;
      featuredCard.href = `game.html?id=${encodeURIComponent(game.id)}`;
    }
  })
  .catch((error) => {
    latestList.innerHTML = `<div class="panel">${error.message}</div>`;
  });
