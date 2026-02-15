Projekt: "Game Library" — Webapp für den Game Club (library.game-club.ch)

Kurzbeschreibung:
Erstelle eine Webapp "Game Library" für den Game Club unter library.game-club.ch. Die App zeigt eine durchsuchbare, filterbare Liste von Games. Mitglieder können Games mit ihrem Steam-Login hinzufügen und bearbeiten. Die Daten sollen möglichst einfach gehalten werden (vorzugsweise JSON-Files im GitHub-Repository oder optional Object Storage). Die Seite wird als statische Webapp für GitHub Pages ausgelegt; notwendige Schreib-APIs können optional über einen kleinen Serverless-Endpunkt oder GitHub API-Token erfolgen.

Funktionale Anforderungen:
- Jeder angemeldete Benutzer (Steam OpenID) kann:
  - Neue Games hinzufügen (automatisch aus Steam/SteamDB oder manuell).
  - Beschreibung eines Games hinzufügen oder editieren.
  - Eigene Tags hinzufügen.
  - Kommentare / Reviews zu einem Game schreiben.
  - Games kategorisieren (Genre) und Genre ändern.
- Filter:
  - Nach Genre (mehrfach auswählbar).
  - Nach Anzahl Spieler (Single, Coop, PvP, 1-2, 2-4, etc.).
- Suche nach Game-Titel (teilweise Treffer, fuzzy).
- API:
  - /api/games.json — Liste aller Games als JSON.
  - /api/game/{appid}.json — Einzelnes Game als JSON.
- Optional:
  - Integrierbarer Game Club Chat Bot (nur Schnittstelle/Platzhalter).
  - Integrierter Game Launcher (Platzhalter / Deep-Linking zu Start/Download).
- UI:
  - Startseite mit neu hinzugefügten Games, meistgesuchten und meistgestarteten Games.
  - Detail-Seite pro Game mit Bildern, Beschreibung, Download/Start-Links, Reviews.
  - Admin-/Moderationstools (optional): Änderungen prüfen, Spam-Filter.

Technik / Architektur:
- Auth: Steam webbrowser-basierte Authentifizierung mit OpenID (https://partner.steamgames.com/doc/features/auth#website). Nach erfolgreicher Steam-Auth erhalten wir SteamID + PublicProfile.
- Frontend: React (Vite) oder SvelteKit (statische Ausgabe), TailwindCSS für UI.
- Hosting: GitHub Pages (statische Assets).
- Storage-Strategien (Priorität):
  1. JSON-Files im GitHub-Repository unter /data/games/*.json (ein File pro Game oder eine Datei für alle Games).
     - Schreibzugriff: Serverless-API (z.B. GitHub App / GitHub Actions / Serverless function) mit einem Service-Token, die Commits oder PRs in das Repo macht.
     - Alternative (sicherer): User-Änderungen erzeugen einen Pull Request (automatisch per API) statt direktem Commit.

Datenmodell (JSON Schema, minimal):
{
  "appid": "string (unique, e.g. steam appid or custom slug)",
  "name": "string",
  "description": "string",
  "preview_image": "url",
  "hero_image": "url",
  "gallery": ["url", "..."],
  "icon": "url",
  "thumbnail": "url",
  "video": "url (optional)",
  "genres": ["Strategy", "Racing", "..."],
  "tags": ["tag1", "tag2"],
  "players": { "min": number, "max": number, "type": "Single|LocalCoop|OnlineCoop|PvP|..." },
  "links": {
    "start_link": "string (deeplink if installed)",
    "download_windows": "url",
    "download_linux": "url"
  },
  "added_by": { "steamid": "string", "display_name": "string", "timestamp": ISO8601 },
  "modified_by": { "steamid": "...", "display_name": "...", "timestamp": ISO8601 },
  "reviews": [
    { "steamid": "...", "display_name": "...", "rating": 1-5, "text": "...", "timestamp": ISO8601 }
  ],
  "stats": { "starts": number, "searches": number, "downloads": number }
}

API-Spezifikation (Beispiele):
- GET /api/games.json
  - returns: [{appid, name, thumbnail, genres, players, short_description, ...}, ...]
- GET /api/game/{appid}.json
  - returns: full JSON object (siehe Schema)
- POST /api/game (auth: Steam)
  - payload: game JSON (validate server-side)
  - action: create game file OR create PR
- PATCH /api/game/{appid} (auth: Steam)
  - payload: partial update
  - action: update file OR create PR
- POST /api/game/{appid}/review (auth: Steam)
  - payload: { rating, text }

Frontend-Routing / Seiten:
- / (Startseite): recent additions, trending, Suche.
- /games: Liste (table/grid) mit Filter/Sort (genre, players, name, tags).
- /game/{appid}: Detail-Seite mit Galerie, Beschreibung, Reviews, Download/Start-Buttons.
- /auth/steam: Login-Start (redirect to Steam OpenID).
- /auth/steam/callback: Callback-Handler (verify, create session JWT).
- /admin (optional): Review-Pending, Moderation.

UX-Details:
- Beim Hinzufügen aus Steam: wenn user eine Steam-App-ID eingibt, rufe Steam-Store-API / Steam Web API / SteamDB (falls erlaubt) ab und fülle Felder automatisch (Name, Bilder, Trailer, Genres). Felder editierbar vor dem Speichern.
- Wenn Benutzer manuell hinzufügen: minimaler Pflichtsatz (name, description, players).
- Tags: frei wählbar + Vorschläge basierend auf existierenden Tags.
- Kommentare/Reviews: erlauben Markdown-Basics, aber store sanitized HTML.
- Bilder: Upload via direkte URL oder via Upload-Endpunkt (speicher in Object Storage oder speichere URL im JSON). Optional: resize/thumbnailing im Build/CI.

Deployment & CI:
- Statischer Build -> GitHub Pages (gh-pages branch oder docs/).
- Schreib-API: deploye als GitHub Action
- Sicherer Umgang mit GitHub Token: verwende GitHub App oder ein Repository Secret für CI; wenn PR-Workflow, minimiert Rechtebedarf.

Beispiel: Beispiel-Spiele (als Sample JSON-Einträge):
- flatout2 (custom-appid: flatout2) -> download link e.g. /downloads/flatout2.zip
- world-in-conflict -> link
- hedgewars -> https://hedgewars.org/
- teeworlds -> https://teeworlds.com/
- beyond-all-reason -> https://www.beyondallreason.info/
- soldat -> https://soldat.pl/en/
- supertuxkart -> https://supertuxkart.net/Main_Page
- openra -> https://www.openra.net/
- renegade-x -> https://totemarts.games/games/renegade-x/
- unreal-tournament -> https://oldunreal.com/downloads/unrealtournament/
- unreal-tournament-2004 -> https://www.oldunreal.com/downloads/ut2004/full-game-installers/

Akzeptanzkriterien (bei Fertigstellung):
- Nutzer können sich mit Steam anmelden.
- Angemeldete Nutzer können neue Games anlegen (via Steam import oder manuell).
- Spiele sind über /api/games.json und /api/game/{appid}.json abrufbar.
- Filter und Suche funktionieren clientseitig (für kleine Bibliothek) oder serverseitig (bei größerer Datenmenge).
- Änderungen werden sicher ins Repo geschrieben oder als PR erzeugt.
- UI responsive und übersichtlich.

Zusätzliche Hinweise an Copilot:
- Erstelle ein Projekt-Scaffold mit:
  - frontend (React/Vite) + Tailwind
  - /data/games/ sample JSON files (mind. 5 Beispiel-Games aus Liste)
  - README mit Setup, Steam API-Keys, GitHub Token Hinweise, Deployment Schritt-für-Schritt (GitHub Pages + Schreib-API)
- Implementiere mindestens:
  - Steam OpenID Login Flow (Client + Callback)
  - Client-seitige CRUD für Games (create/edit UI) mit Calls an /api/*
  - /api endpoints: GET /api/games.json, GET /api/game/{appid}.json, POST /api/game, PATCH /api/game/{appid}, POST /api/game/{appid}/review (Server/Stub that simulates commit or creates PR — implement as real GitHub REST commit if secrets provided, otherwise implement as "dry-run" that writes to local /data for development)
  - Validierung der Eingaben und Sanitisierung von Reviews.
- Generiere außerdem: Beispiel-Konfigurationsdatei config.example.json mit Informationen zu GitHub-Token, GitHub-Repo-Pfad, Steam API-Key.

Lieferumfang (erwarte von Copilot):
- Vollständiger Projekt-Scaffold (package.json, vite config, src components, pages, api stubs).
- Beispiel- /data/games/*.json Dateien mit den vorgegebenen Beispielen.
- README.md mit Betriebsanleitung (wie Steam-API, wie GitHub token setzen, wie PR-Workflow einrichten).
- Hinweise für mögliche Erweiterungen: Chat Bot Schnittstelle, Game Launcher Deep-Linking.

Beispiel-Kurzbeschreibung (für README):
„Game Library ist eine statische Webapp für den Game Club, die eine durchsuchbare Sammlung von Games bereitstellt. Mitglieder melden sich mit ihrem Steam-Account an, können Games hinzufügen und kommentieren. Daten werden als JSON im Repository gespeichert; Änderungen werden per PR oder direktem Commit (Service-Token) eingetragen.“

Ziel:
Generiere jetzt das ganze Projekt-Scaffold und die wichtigsten Implementierungen (Frontend + minimale Backend-Stubs) so dass die App lokal lauffähig ist und auf GitHub Pages deployed werden kann. Füge Beispiel-Daten ein und dokumentiere genau, wie man Steam-Auth einrichtet und wie man Schreibzugriff auf das Repo konfiguriert.

Priorität bei Implementierung:
1. Auth (Steam OpenID + Session)
2. Read-APIs und Anzeige der Games
3. Hinzufügen / Editieren Workflow (erst lokal /data, dann optional GitHub commit/PR)
4. Search + Filter + Reviews
5. Deployment-Anleitung