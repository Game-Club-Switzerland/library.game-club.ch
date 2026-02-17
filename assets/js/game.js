const gameId = new URLSearchParams(window.location.search).get('id');
const heroWrap = GameLibrary.qs('[data-game-hero]');
const detailWrap = GameLibrary.qs('[data-game-detail]');

const renderGame = (game) => {
  heroWrap.innerHTML = `
    <img src="${game.media.hero}" alt="${game.name} hero" />
  `;

  detailWrap.innerHTML = `
    <div class="detail-hero">
      <div class="detail-media">
        <h2>${game.name}</h2>
        <p class="card-meta">${game.description}</p>
        <div class="badges">
          ${game.tags.map((tag) => `<span class="badge">${tag}</span>`).join('')}
        </div>
        <div class="gallery">
          ${game.media.screenshots.map((src) => `<img src="${src}" alt="${game.name} screenshot" loading="lazy" />`).join('')}
        </div>
      </div>
      <div class="detail-meta panel">
        <div class="meta-row"><span>Genre</span><span>${game.genres.join(', ')}</span></div>
        <div class="meta-row"><span>Player</span><span>${GameLibrary.formatPlayers(game.players)}</span></div>
        <div class="meta-row"><span>Added</span><span>${game.addedAt}</span></div>
        <div class="meta-row"><span>Updated</span><span>${game.updatedAt}</span></div>
        <div class="link-list">
          ${game.startLink ? `<a href="${game.startLink}">Starten<span>Local</span></a>` : ''}
          ${game.downloads?.windows ? `<a href="${game.downloads.windows}">Windows Download<span>Setup</span></a>` : ''}
          ${game.downloads?.linux ? `<a href="${game.downloads.linux}">Linux Download<span>Tar</span></a>` : ''}
          ${game.steam?.steamdb ? `<a href="${game.steam.steamdb}">SteamDB<span>Info</span></a>` : ''}
          ${game.steam?.store ? `<a href="${game.steam.store}">Steam Store<span>Info</span></a>` : ''}
          ${game.homepage ? `<a href="${game.homepage}">Homepage<span>Official</span></a>` : ''}
        </div>
      </div>
    </div>
    ${game.media.video ? `
      <div class="section">
        <h3>Video</h3>
        <div class="panel">
          <video controls src="${game.media.video}" style="width:100%"></video>
        </div>
      </div>
    ` : ''}
  `;
};

if (!gameId) {
  detailWrap.innerHTML = '<div class="panel">Missing game id.</div>';
} else {
  GameLibrary.fetchGame(gameId)
    .then(renderGame)
    .catch((error) => {
      detailWrap.innerHTML = `<div class="panel">${error.message}</div>`;
    });
}
