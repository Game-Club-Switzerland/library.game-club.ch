# Game Library

Game Library ist eine statische Webapp fuer den Game Club, die eine durchsuchbare Sammlung von Games bereitstellt. Mitglieder melden sich mit ihrem Steam-Account an, koennen Games hinzufuegen und kommentieren. Daten werden als JSON im Repository gespeichert; Aenderungen werden per PR oder direktem Commit (Service-Token) eingetragen.

## Features
- Steam OpenID Login Flow (Client + Callback)
- Durchsuchbare Games-Liste mit Genre- und Spieler-Filter
- Game-Detailseiten mit Reviews und Download/Start-Links
- Clientseitige CRUD-Stubs (lokal in Browser Storage oder via GitHub Write API)
- Statische JSON-API unter /api/* fuer GitHub Pages

## Struktur
- /public/api/games.json: Zusammenfassung aller Games
- /public/api/game/*.json: Detaildaten pro Game
- /data/games/*.json: Quelle fuer Game-Daten im Repo
- /public/config.json: Laufzeit-Konfiguration fuer Steam + Write Mode
- /config.example.json: Beispiel fuer Produktiv-Konfiguration

## Setup
1. Abhaengigkeiten installieren
   - npm install
2. Dev-Server starten
   - npm run dev
3. Build erstellen
   - npm run build

## Steam Auth (OpenID)
- Setze in public/config.json die Felder steamRealm und steamReturnUrl.
- steamRealm muss exakt dem Basis-Host deiner Deployment-URL entsprechen.
- steamReturnUrl muss auf /#/auth/steam/callback zeigen.
- Die App speichert nach dem Callback eine lokale Session.
- In Produktion muss die OpenID-Antwort serverseitig validiert werden.

## Steam API Key (optional)
- Der Steam API Key gehoert nicht in public/config.json.
- Lege ihn als Secret im Serverless-Backend oder in CI an.
- config.example.json zeigt die benoetigten Felder fuer die Server-Seite.

## Write API (GitHub Commit oder PR)
- writeMode: "local" speichert Aenderungen im Browser (localStorage).
- writeMode: "github" sendet Requests an githubApiUrl.
- githubApiUrl muss auf einen Serverless-Endpunkt zeigen, der:
  - POST /api/game (neues Game erstellen)
  - POST /api/game/{appid} (PATCH-Update)
  - POST /api/game/{appid}/review (Review hinzufuegen)
  - Optional: PR statt Commit erzeugen
- githubToken und githubRepo duerfen nicht im Client liegen.

### Serverless Stub
- Ein Beispiel befindet sich unter /serverless/write-api.ts.
- LOCAL_WRITE=true schreibt in /data/games (nur lokal fuer Entwicklung).
- GITHUB_TOKEN und GITHUB_REPO aktivieren echte Commits via GitHub REST API.

## Datenpflege
- Game-Dateien liegen unter /data/games/*.json.
- Fuer das statische Hosting sind dieselben Daten unter /public/api/* vorhanden.
- Beim Import aus Steam oder SteamDB werden Felder wie Name, Bilder, Trailer, Genres befuellt.

## Deployment (GitHub Pages)
- Build erzeugt statische Assets in /dist.
- Konfiguriere GitHub Pages auf den /dist Ordner oder den gh-pages Branch.
- Nutze eine Custom Domain (library.game-club.ch), damit Steam OpenID richtig funktioniert.

## Erweiterungen (optional)
- Chat-Bot Schnittstelle fuer Game Club
- Game Launcher Deep-Linking
- Admin-Moderation mit Review-Queue
- Spam-Filter und Automationen
