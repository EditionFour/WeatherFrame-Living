# Deployment

## Ziel

Die Website soll unter `https://www.kleinsorge.ch/wetter/` veröffentlicht
werden. Der Domain-Document-Root ist `/photographie/`; das zugehörige
FTP-Verzeichnis für dieses Projekt ist `/photographie/wetter/`.

## Automatischer Upload

VS Code verwendet die Erweiterung `Natizyskunk.sftp`. Die lokale Konfiguration
liegt in `.vscode/sftp.json` und lädt gespeicherte Dateien automatisch über
verschlüsseltes FTPS hoch (`uploadOnSave: true`, Port 21, `secure: true`).

Nicht veröffentlicht werden unter anderem `.git`, `.vscode`, `.DS_Store`,
Logdateien und die Git-Konfiguration. Zugangsdaten bleiben ausschließlich in
der lokal ignorierten `.vscode/sftp.json` und dürfen nicht committet werden.

## Verifikation vom 3. Juli 2026

- FTP/FTPS-Verbindung zu `w00926cb.kasserver.com` erfolgreich.
- SFTP/SSH auf Port 22 nicht verfügbar (Verbindung abgewiesen).
- FTP-Root und Domainverzeichnis lesend geprüft.
- Im ALL-INKL-KAS bestätigter Domain-Document-Root: `/photographie/`.
- Korrekter, beschreibbarer FTP-Pfad: `/photographie/wetter/`.
- Initialer FTPS-Upload erfolgreich; `http://www.kleinsorge.ch/wetter/`
  antwortet mit HTTP 200.
- `www.kleinsorge.ch` und `kleinsorge.ch` zeigen auf `85.13.139.13`.
- Ein Let's-Encrypt-Zertifikat für `kleinsorge.ch` und `www.kleinsorge.ch` ist
  aktiv und wird automatisch verlängert.
- `https://www.kleinsorge.ch/wetter/` antwortet erfolgreich mit HTTP 200; die
  Zertifikatsprüfung ist fehlerfrei.

## Funktionsprüfung nach Änderungen

Nach dem Speichern zeigt die VS-Code-Ausgabe der SFTP-Erweiterung den Upload an.
Danach sollte `https://www.kleinsorge.ch/wetter/` in einem privaten Browserfenster
neu geladen werden.

## Wartungsstand

Am 3. Juli 2026 wurde die bestehende Dashboard-Basis überarbeitet:

- fehlerhafte leere Grid-Zeile entfernt;
- Hintergrundebenen eingebunden;
- nächste 24 Stunden anhand der tatsächlichen API-Zeit statt des Array-Index
  ermittelt;
- alle Open-Meteo-Wettercodes abgedeckt;
- Fehlerzustand und barrierearme Statusausgabe ergänzt;
- Darstellung für kleinere Bildschirme stabilisiert.

Die visuelle Zielstruktur wurde anschließend an das ursprüngliche TV-Konzept
angepasst: Aktuelles Wetter und astronomische Daten bilden die Hauptfläche, die
optisch hervorgehobene 16-Stunden-Prognose mit acht Kacheln im
Zwei-Stunden-Abstand steht über der kompakteren
10-Tage-Prognose.

Lokale Hintergrundbilder wechseln automatisch anhand der aktuellen Daten:

- Nacht: Winterlandschaft bei Nacht;
- Regen, Schauer oder Gewitter: bewölkte Regenlandschaft;
- 90 Minuten vor Sonnenuntergang sowie im Herbst: goldene Abendlandschaft;
- sonst: klare sommerliche Tageslandschaft.

Die Auswahl wird nach jedem Wetterabruf, spätestens alle zehn Minuten, neu
bewertet. Alle Hintergründe liegen lokal unter `assets/photos/`; die Seite ist
damit nicht von einem externen Fotodienst abhängig.

Die Wetterdarstellung verwendet lokal eingebundene Meteocons-SVGs von Bas
Milius anstelle plattformabhängiger Emojis. Das Iconset steht unter MIT-Lizenz;
der Lizenztext liegt unter `assets/icons/METEOCONS-LICENSE.txt`.

Die zentralen Symbole für Sonne, Wolken, Sonne-Wolke, Regen und Mond wurden
zusätzlich als statische, transparente PNGs eng nach der freigegebenen
Dashboard-Referenz gestaltet. Sie liegen unter `assets/icons/reference/` und
werden für die häufigsten Wetterlagen bevorzugt; Meteocons bleiben als
Fallback für Schnee, Nebel, Eis und Gewitter erhalten. Zusätzliche
Referenzvarianten decken klare und bewölkte Nächte, Starkregen sowie Gewitter
mit Hagel ab. Open-Meteos `is_day` steuert die Tag-/Nacht-Symbole auch in der
16-Stunden-Vorschau.

Alle acht Mondphasen besitzen ein eigenes realistisches PNG. Die einfache
Mondaltersberechnung ordnet Neumond, zunehmende Sichel, erstes Viertel,
zunehmenden Mond, Vollmond, abnehmenden Mond, letztes Viertel und abnehmende
Sichel automatisch dem passenden Bild zu.

Das primäre Layoutziel ist Full HD (1920 × 1080). Ein eigener CSS-Breakpoint
definiert dafür 24 Pixel seitlichen Sicherheitsrand, feste Höhen für Kopfzeile
und Prognoseflächen sowie vollständig sichtbare Reihen mit acht Stunden- und
zehn Tageskacheln. Unterhalb dieses Formats greifen die responsiven Regeln.

Für Samsung The Frame erkennt die Seite den Tizen-/Smart-TV-User-Agent und setzt
eine feste UHD-Webfläche von 1920 × 1080 mit zusätzlichem Overscan-Rand. Ältere
Tizen-Browser ohne `backdrop-filter` erhalten blickdichte Glas-Fallbacks. Nach
Standby oder einer wiederhergestellten Netzwerkverbindung werden Uhr und
Wetterdaten sofort aktualisiert.

## Eigene Hintergrundbilder

Die passwortgeschützte Fotoverwaltung liegt unter `/wetter/upload.php`. Sie
akzeptiert JPEG, PNG und WebP ab 1280 × 720 Pixeln und ordnet Uploads nach
Jahreszeit, Tageszeit und Wetter ein. Das Passwort liegt ausschließlich in der
von Git ignorierten Datei `upload-config.php`.

Die Bilder und ihr Manifest werden serverseitig unter
`assets/photos/custom/` gespeichert. Dieser Ordner ist ebenfalls von Git und
der lokalen SFTP-Synchronisation ausgenommen, damit automatische Deployments
keine Benutzerfotos überschreiben. `gallery.js` bevorzugt den am genauesten
passenden eigenen Upload; bei mehreren gleichwertigen Treffern wechselt die
Auswahl stündlich. Ohne Treffer werden die mitgelieferten Hintergründe genutzt.
