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
          ${(game.categories ?? []).map((category) => `<span class="badge">${category}</span>`).join('')}
        </div>
        <div class="gallery">
          ${game.media.screenshots.map((src) => `<img src="${src}" alt="${game.name} screenshot" loading="lazy" />`).join('')}
        </div>
      </div>
      <div class="detail-meta panel">
        <div class="action-buttons">
          ${game.steam?.appid ? `<a href="steam://launch/${game.steam.appid}" class="button-link"><svg width="16" height="16" viewBox="0 0 16 16" class="octicon octicon-steam" aria-hidden="true"><path d="M8 0a8 8 0 00-8 7.47c.07.1.13.21.18.32l4.15 1.67a2.2 2.2 0 011.31-.36l1.97-2.8v-.04c0-1.65 1.37-3 3.05-3a3.03 3.03 0 013.05 3 3.03 3.03 0 01-3.12 3l-2.81 1.97c0 .3-.05.6-.17.9a2.25 2.25 0 01-4.23-.37L.4 10.56A8.01 8.01 0 108 0zm2.66 4.27c-1.12 0-2.03.9-2.03 2s.91 1.99 2.03 1.99c1.12 0 2.03-.9 2.03-2s-.9-2-2.03-2zm0 .5c.85 0 1.53.66 1.53 1.49s-.68 1.5-1.53 1.5c-.84 0-1.52-.67-1.52-1.5s.68-1.5 1.52-1.5zM5.57 9.6c-.22 0-.43.04-.62.11l1.02.42c.65.26.95.99.68 1.62-.27.63-1 .93-1.65.67l-1-.4a1.73 1.73 0 003.13-.08c.18-.42.18-.88.01-1.3A1.69 1.69 0 005.57 9.6z"></path></svg>Launch</a>` : ''}
          ${game.startLink ? `<a href="${game.startLink}" class="button-link">Starten</a>` : ''}
        </div>
        <div class="meta-row"><span>Genre</span><span>${game.genres.join(', ')}</span></div>
        <div class="meta-row"><span>Player</span><span>${GameLibrary.formatPlayers(game.players)}</span></div>
        <div class="meta-row"><span>Added</span><span>${game.addedAt}</span></div>
        <div class="meta-row"><span>Updated</span><span>${game.updatedAt}</span></div>
        <div class="link-list">
          ${game.downloads?.windows ? `<a href="${game.downloads.windows}">Windows Download<span>Setup</span></a>` : ''}
          ${game.downloads?.linux ? `<a href="${game.downloads.linux}">Linux Download<span>Tar</span></a>` : ''}
          ${game.steam?.steamdb ? `<a href="${game.steam.steamdb}" target="_blank"><svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="octicon octicon-steamdb" aria-hidden="true"><title>SteamDB</title><path d="M11.981 0C5.72 0 .581 2.231.02 5.081l6.675 1.257c.544-.17 1.162-.244 1.8-.244l3.131-1.875c-.037-.469.244-.956.881-1.35.9-.581 2.307-.9 3.732-.9a8.582 8.582 0 012.812.412c2.1.713 2.569 2.082 1.069 3.057-.956.618-2.494.937-4.013.9l-4.125 1.48c-.037.3-.243.582-.637.845-1.106.712-3.263.88-4.8.356-.675-.225-1.125-.563-1.313-.9L.47 7.2c.431.675 1.125 1.294 2.025 1.838C.938 9.938 0 11.062 0 12.28c0 1.2.9 2.307 2.419 3.206C.9 16.37 0 17.476 0 18.675 0 21.619 5.363 24 12 24c6.619 0 12-2.381 12-5.325 0-1.2-.9-2.306-2.419-3.188C23.1 14.588 24 13.482 24 12.282c0-1.219-.938-2.362-2.512-3.262 1.556-.956 2.493-2.138 2.493-3.413 0-3.093-5.381-5.606-12-5.606zm4.275 2.663c-.975.018-1.912.225-2.512.618-1.031.675-.713 1.594.712 2.082 1.425.487 3.394.337 4.425-.338 1.032-.675.713-1.594-.712-2.062a6.376 6.376 0 00-1.913-.282zm.057.318c1.387 0 2.493.525 2.493 1.163 0 .637-1.106 1.162-2.493 1.162-1.388 0-2.494-.525-2.494-1.162 0-.638 1.106-1.163 2.494-1.163zM8.493 6.45c-.3.019-.58.038-.862.075l1.707.319a2.03.94 0 11-1.52 1.744l-1.668-.32c.188.17.45.32.806.45 1.2.413 2.888.282 3.75-.28.863-.563.6-1.35-.6-1.744-.487-.169-1.068-.244-1.612-.244zm11.944 3.113v1.743c0 2.063-3.787 3.732-8.437 3.732-4.669 0-8.437-1.67-8.437-3.732V9.581c2.156.994 5.137 1.613 8.418 1.613 3.3 0 6.3-.619 8.475-1.631zm0 6.487v1.65c0 2.063-3.787 3.731-8.437 3.731-4.669 0-8.437-1.668-8.437-3.731v-1.65c2.175.956 5.137 1.538 8.437 1.538s6.281-.582 8.438-1.538z"/></svg>SteamDB<span>Info</span></a>` : ''}
          ${game.steam?.store ? `<a href="${game.steam.store}" target="_blank">Steam Store<span>Info</span></a>` : ''}
          ${game.links?.steamgriddb ? `<a href="${game.links.steamgriddb}" target="_blank">SteamGridDB<span>Media</span></a>` : ''}
          ${game.homepage ? `<a href="${game.homepage}" target="_blank">Homepage<span>Official</span></a>` : ''}
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
