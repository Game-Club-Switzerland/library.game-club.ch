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
          ${game.steam?.appid ? `<a href="steam://launch/${game.steam.appid}"><svg width="16" height="16" viewBox="0 0 16 16" class="octicon octicon-steam" aria-hidden="true"><path d="M8 0a8 8 0 00-8 7.47c.07.1.13.21.18.32l4.15 1.67a2.2 2.2 0 011.31-.36l1.97-2.8v-.04c0-1.65 1.37-3 3.05-3a3.03 3.03 0 013.05 3 3.03 3.03 0 01-3.12 3l-2.81 1.97c0 .3-.05.6-.17.9a2.25 2.25 0 01-4.23-.37L.4 10.56A8.01 8.01 0 108 0zm2.66 4.27c-1.12 0-2.03.9-2.03 2s.91 1.99 2.03 1.99c1.12 0 2.03-.9 2.03-2s-.9-2-2.03-2zm0 .5c.85 0 1.53.66 1.53 1.49s-.68 1.5-1.53 1.5c-.84 0-1.52-.67-1.52-1.5s.68-1.5 1.52-1.5zM5.57 9.6c-.22 0-.43.04-.62.11l1.02.42c.65.26.95.99.68 1.62-.27.63-1 .93-1.65.67l-1-.4a1.73 1.73 0 003.13-.08c.18-.42.18-.88.01-1.3A1.69 1.69 0 005.57 9.6z"></path></svg>Steam Launch<span>Client</span></a>` : ''}
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
