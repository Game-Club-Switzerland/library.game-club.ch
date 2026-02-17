Bitte entwerfe und implementiere eine Webapp „Game Library“ für den Game Club unter library.game-club.ch, optisch angelehnt an https://steamdb.info/.
Die App läuft über GitHub Pages und bezieht neue/aktualisierte Spiele über GitHub Discussions (Bereich „Game“) via GitHub Actions.

Funktionen

Suche nach Game‑Titel
Filter nach Genre, Anzahl Player, Tags
API: /api/games.json (alle Games)
API: /api/game/{appid}.json (ein Game)
Zufalls‑Generator mit Filter (Genre, Player)
Neue Games via GitHub Discussion „Game“
Updates, wenn Discussion geändert wird
Wenn appid oder Steam/SteamDB‑Link vorhanden: Daten wie Bilder, Icons, Beschreibung, Tags, Player‑Anzahl automatisch ergänzen
Seiten

Startseite mit neuesten Games
Library/Katalog mit Suche & Filtern
Detail‑Seite pro Game
Zufallsgenerator‑Seite
Design

Look & Feel wie steamdb.info
Game Club Logo
Game‑Felder (Detail‑Seite)

Name, Beschreibung
Vorschau‑Bild, Hauptbild, Galerie‑Bilder
Icon‑Bild, Mini‑Bild (für Tabelle wie steamdb.info)
Video (falls vorhanden, bevorzugt von Steam)
Genre, Tags
Start‑Link (lokal) oder Download‑Links
Windows‑Download
Linux‑Download (sonst Windows‑Link)
Link zu SteamDB und Steam Store (falls vorhanden)
Beispiel‑Games

FlatOut 2 → Link zu File
World in Conflict → Link zu File
Hedgewars — https://hedgewars.org/
Teeworlds — https://teeworlds.com/
Beyond All Reason — https://www.beyondallreason.info/
Soldat — https://soldat.pl/en/
SuperTuxKart — https://supertuxkart.net/Main_Page
OpenRA — https://www.openra.net/
Renegade X — https://totemarts.games/games/renegade-x/
Unreal Tournament — https://oldunreal.com/downloads/unrealtournament/
Unreal Tournament 2004 — https://www.oldunreal.com/downloads/ut2004/full-game-installers/
Erwartung

Liefere eine klare Projektstruktur, Datenmodell, API‑Outputs (JSON), UI‑Komponenten, GitHub Action Workflow‑Skizze und Beispiel‑Daten.