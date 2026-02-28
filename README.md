# ⚽ False-9

A daily football player guessing game built with React. Guess the mystery Big 5 league player from attribute clues — nationality, club, position, league, and age. You get 9 attempts.


---

## How It Works

A random star player from the Big 5 European leagues is selected by the system as the mystery player. Type any player's name into the search bar and select them. Six tiles will flip and reveal how your guess compares to the answer:

| Tile | Colour | Meaning |
|------|--------|---------|
| 🟢 Green | Correct | Exact match |
| 🔴 Red | Wrong | No match |
| ▲ Higher | Red + arrow | Correct player is older |
| ▼ Lower | Red + arrow | Correct player is younger |

You have **9 guesses**. If you run out, the answer is revealed.

---

## Tech Stack

- **React** — UI and game state
- **Firebase Firestore** — stores club and league badge image URLs
- **flagcdn.com** — flag images by ISO country code
- **CSS** — custom animations, glassmorphism, pitch grid background

---

## Project Structure

```
src/
├── App.jsx          # Main game component + Tile component
├── App.css          # All styles
├── firebase.js      # Firebase config and db export
└── data/
    └── players.json # Player dataset
```

### `players.json` shape

Each player object should follow this structure:

```json
{
  "name": "Harry Kane",
  "search": "harry kane",
  "natCode": "ENG",
  "club": "Bayern Munich",
  "league": "Bundesliga",
  "pos": "ST",
  "age": 31,
  "isStar": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Full display name |
| `search` | string | Lowercase version used for search filtering |
| `natCode` | string | 3-letter FIFA nationality code (e.g. `ENG`, `BRA`) |
| `club` | string | Current club — must match Firestore key exactly |
| `league` | string | League name — must match Firestore key exactly |
| `pos` | string | Position abbreviation (e.g. `ST`, `CB`, `GK`) |
| `age` | number | Player's current age |
| `isStar` | boolean | Only `true` players are selected as the mystery player |

### Firebase Firestore structure

Two documents under the `assets` collection:

```
assets/
├── clubs    → { "Bayern Munich": "<image_url>", "Arsenal": "<image_url>", ... }
└── leagues  → { "Bundesliga": "<image_url>", "Premier League": "<image_url>", ... }
```

Keys must match the `club` and `league` fields in `players.json` exactly (whitespace is trimmed automatically).

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore enabled

### Installation

```bash
git clone https://github.com/YuvrajHajari/false-9.git
cd false-9
npm install
```

### Firebase setup

Create `src/firebase.js`:

```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // ...
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### Run locally

```bash
npm start
```

### Build for production

```bash
npm run build
```

---

## Nationality Codes

The app maps 3-letter FIFA codes to 2-letter ISO codes for flag images. The full mapping lives at the top of `App.jsx` in the `NAT_TO_FLAG` object. If a player's nationality isn't displaying a flag, add their mapping there:

```js
const NAT_TO_FLAG = {
  ENG: 'gb-eng',
  ESP: 'es',
  BRA: 'br',
  // add more here
};
```

---

## Features

- 🔍 Live player search with dropdown
- 🟩 Colour-coded tile reveal with staggered left-to-right animation
- ⬆⬇ Age direction arrows
- 🏆 Win / loss result screen with answer reveal
- 🔄 Play again without page reload
- 📜 Rules section with smooth scroll
- 📱 Fully responsive down to mobile
- ⚽ Pitch grid background with stadium aesthetic

---

## Author

Made with ♥ by **Yuvi**

- LinkedIn: [yuvraj-singh-hajari](https://linkedin.com/in/yuvraj-singh-hajari-b40373277/)
- yuvrajhajari@gmail.com
