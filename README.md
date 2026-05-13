# FirmaCheck

Praktický úkol: jednoduchá webová aplikace na ověření české firmy podle IČO.  
Zadám IČO, aplikace načte data z ARES, ověří název firmy (pokud ho vyplním), zobrazí sídlo na mapě, ukládá výsledek do SQLite cache a umí exportovat uložené firmy do CSV.

Projekt jsem s pomocí Gemini PRO + Cursor splnil do této podoby za 3 hodiny cca.

## Živé demo

- Demo URL: `DOPLŇ_PO_NASAZENI`
- GitHub repo: `DOPLŇ_URL_REPO`

## Funkce

- ověření firmy podle IČO přes ARES API,
- validace IČO (8 číslic),
- kontrola názvu firmy: shoda / částečná shoda / neshoda,
- geocoding sídla + mapa s markerem,
- SQLite cache pro ARES i geocoding,
- zobrazení zdroje dat (`api` / `cache`),
- uložení firmy do seznamu + odebrání firmy,
- export uložených firem do CSV.

## Technologický stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Turso (libSQL / SQLite)

## Použité API služby

- ARES API: `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}`
- Geocoding: OpenStreetMap Nominatim API
- Mapa: OpenStreetMap embed + odkaz do mapy

Zvolil OpenStreetMap stack kvůli rychlé integraci bez API klíče.

## Spuštění lokálně

Požadavky:

- Node.js 20+
- Turso databáze + token

Nastavení prostředí:

1. zkopíruj `.env.example` do `.env.local`,
2. doplň:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`

Instalace a spuštění:

```bash
npm install
npm run dev
```

Aplikace poběží na `http://localhost:3000`.

## SQLite cache a ukládání firem

Aplikace používá Turso databázi (libSQL), která je SQLite-kompatibilní a perzistentní i na serverless hostingu.

Tabulky:

- `companies_cache`: cache ARES odpovědí podle IČO
- `geocoding_cache`: cache geocoding výsledků podle adresy
- `saved_companies`: uživatelem uložené firmy

Chování:

- První dotaz na IČO: data se berou z API a uloží do cache
- Opakovaný dotaz na stejné IČO/adresu: data se berou z cache
- V UI se vypisuje zdroj (`api` / `cache`)

## CSV export

CSV obsahuje minimálně:

- IČO
- obchodní název
- právní formu
- stav subjektu
- adresu sídla
- datum vzniku
- datum posledního ověření
- zdroj posledního načtení dat (API/cache)
- souřadnice sídla (pokud jsou dostupné)

## AI vizuální prvek

Použil jsem AI vizuál v hero sekci aplikace.

- nástroj: **Nanobanana 2**
- prompt:  
  `Minimalist 3D isometric illustration of a modern glass office building with a glowing green checkmark hovering above it, clean white background, soft lighting, tech startup style.`
- umístění: horní část stránky (`app/page.tsx`), aby bylo hned vizuálně jasné, že aplikace řeší ověřování firem.

## Ukázky promptů

1. `Jsi v roli profesionálního programátora, zde je celkové zadání tvé práce (odkaz). Vytvoř kompletní adresářovou strukturu projektu s tímto tech stackem: ...`
2. `Uprav strukturu na smysluplnou kostru pro ARES + geocoding + SQLite cache + uložené firmy + export`
3. `Implementuj podle tohoto zadání ... logiku a funkcionalitu projektu.`
4. `Po spuštění přes "npm run dev" dostávám tuto chybu v terminálu: (odkaz) analyzuj v kódu příčinu a oprav..`

## Iterace během práce 

### Iterace 1

- Cíl: připravit čistou architekturu projektu.
- Výsledek: rozdělení do modulů `app/api`, `lib`, `db`, `components`, `types`.

### Iterace 2

- Cíl: dokončit celý uživatelský flow.
- Výsledek: ověření firmy, cache, mapa, ukládání firem, CSV export.

## Deployment poznámky

### Důležité omezení

Turso vyžaduje správně nastavené environment variables v lokálu i na hostingu:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

Bez nich API route skončí chybou při startu DB klienta.

## Turso setup (rychlý postup)

```bash
turso db create firmacheck
turso db show firmacheck
turso db tokens create firmacheck
```

Hodnoty z výstupu vlož do `.env.local` a do env proměnných na Vercelu/Netlify.

## Co bych vylepšil s více časem(a nevyčerpání free kreditů v Cursoru)

- Přidal export do JSON + kopírování do schránky
- Přidal filtrování a řazení uložených firem
- Přidal integrační testy API route
- Přepnul geocoding na Mapy.com API (v souladu s preferencí zadání)
- Celkový vizuál stránky
