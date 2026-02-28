import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, getDoc } from "firebase/firestore";
import playersData from './data/players.json';
import './App.css';

const NAT_TO_FLAG = {
  ENG: 'gb-eng', SCO: 'gb-sct', WAL: 'gb-wls', NIR: 'gb-nir',
  ESP: 'es', FRA: 'fr', GER: 'de', ITA: 'it', POR: 'pt',
  NED: 'nl', BEL: 'be', ARG: 'ar', BRA: 'br', URU: 'uy',
  COL: 'co', CHL: 'cl', MEX: 'mx', USA: 'us', CAN: 'ca',
  SEN: 'sn', GHA: 'gh', NGA: 'ng', CMR: 'cm', CIV: 'ci',
  MAR: 'ma', EGY: 'eg', ALG: 'dz', TUN: 'tn', ZAM: 'zm',
  DEN: 'dk', NOR: 'no', SWE: 'se', FIN: 'fi', SUI: 'ch',
  AUT: 'at', CRO: 'hr', SRB: 'rs', POL: 'pl', CZE: 'cz',
  SVK: 'sk', HUN: 'hu', ROU: 'ro', GRE: 'gr', TUR: 'tr',
  RUS: 'ru', UKR: 'ua', SVN: 'si', BUL: 'bg', ALB: 'al',
  MNE: 'me', BIH: 'ba', NMK: 'mk', GEO: 'ge', ARM: 'am',
  AZE: 'az', KAZ: 'kz', JPN: 'jp', KOR: 'kr', CHN: 'cn',
  AUS: 'au', NZL: 'nz', IRI: 'ir', IRQ: 'iq', SAU: 'sa',
  QAT: 'qa', UAE: 'ae', ISR: 'il', CRC: 'cr', JAM: 'jm',
  TRI: 'tt', HON: 'hn', PAN: 'pa', ECU: 'ec', PAR: 'py',
  BOL: 'bo', PER: 'pe', VEN: 've', DOM: 'do', HAI: 'ht',
  GAB: 'ga', COD: 'cd', ANG: 'ao', MOZ: 'mz', GUI: 'gn',
  MLI: 'ml', BFA: 'bf', TOG: 'tg', BEN: 'bj', CPV: 'cv',
  GAM: 'gm', LBR: 'lr', SLE: 'sl', GNB: 'gw', MTN: 'mr',
};

const getFlagCode = (natCode) =>
  NAT_TO_FLAG[natCode?.toUpperCase()] ?? natCode?.toLowerCase();

const MAX_GUESSES = 9;

function App() {
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [guesses, setGuesses]           = useState([]);
  const [assetMap, setAssetMap]         = useState({ clubs: {}, leagues: {} });
  const [searchTerm, setSearchTerm]     = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [won, setWon]   = useState(false);
  const [lost, setLost] = useState(false);

  const rulesRef = useRef(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const clubDoc   = await getDoc(doc(db, "assets", "clubs"));
        const leagueDoc = await getDoc(doc(db, "assets", "leagues"));
        const rawClubs   = clubDoc.data()   || {};
        const rawLeagues = leagueDoc.data() || {};
        const cleanClubs = {}, cleanLeagues = {};
        Object.keys(rawClubs).forEach(k   => cleanClubs[k.trim()]   = rawClubs[k]);
        Object.keys(rawLeagues).forEach(k => cleanLeagues[k.trim()] = rawLeagues[k]);
        setAssetMap({ clubs: cleanClubs, leagues: cleanLeagues });
      } catch (err) {
        console.error("Firebase fetch error:", err);
      }
    };
    fetchAssets();
    initGame();
  }, []);

  const initGame = () => {
    const stars = playersData.filter(p => p.isStar);
    setTargetPlayer(stars[Math.floor(Math.random() * stars.length)]);
    setGuesses([]);
    setWon(false);
    setLost(false);
    setSearchTerm("");
    setFilteredPlayers([]);
  };

  const selectPlayer = (player) => {
    if (guesses.find(g => g.name === player.name) || won || lost) return;
    const next = [player, ...guesses];
    setGuesses(next);
    setSearchTerm("");
    setFilteredPlayers([]);
    if (player.name === targetPlayer.name) {
      setWon(true);
    } else if (next.length >= MAX_GUESSES) {
      setLost(true);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setFilteredPlayers(
      val.length > 1
        ? playersData
            .filter(p => p.search.includes(val.toLowerCase()))
            .filter(p => !guesses.find(g => g.name === p.name))
            .slice(0, 6)
        : []
    );
  };

  const scrollToRules = () =>
    rulesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const guessesLeft = MAX_GUESSES - guesses.length;
  const gameOver    = won || lost;

  if (!targetPlayer) return <div className="loading">Entering the Pitch…</div>;

  return (
    <div className="App">
      {/* Pitch grid lines background */}
      <div className="pitch-grid" aria-hidden="true" />

      {/* ── HEADER ── */}
      <header>
        <p className="logo-eyebrow">Daily Football Challenge</p>
        <h1>FALSE<em>-9</em></h1>
        <p className="logo-sub">Guess the mystery player</p>

        <button className="scroll-arrow-btn" onClick={scrollToRules} aria-label="View rules">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          How to Play
        </button>

        {/* Guess dots */}
        <div className="lives-bar">
          <div className="lives-dots">
            {Array.from({ length: MAX_GUESSES }).map((_, i) => (
              <span key={i} className={`life-dot ${i >= guessesLeft ? 'used' : ''}`} />
            ))}
          </div>
          <span>{guessesLeft} guess{guessesLeft !== 1 ? 'es' : ''} left</span>
        </div>

        {/* Search — hidden when game over */}
        {!gameOver && (
          <div className="search-container">
            <input
              placeholder="Search Big 5 players…"
              value={searchTerm}
              onChange={handleSearch}
              autoComplete="off"
              spellCheck="false"
            />
            {filteredPlayers.length > 0 && (
              <ul className="search-results">
                {filteredPlayers.map((p, i) => (
                  <li key={i} onClick={() => selectPlayer(p)}>
                    {p.name}
                    <span className="dropdown-club">{p.club}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </header>

      {/* ── COLUMN HEADERS ── */}
      <div className="header-row">
        <div className="header-cell">Player</div>
        <div className="header-cell">Nation</div>
        <div className="header-cell">Club</div>
        <div className="header-cell">Position</div>
        <div className="header-cell">League</div>
        <div className="header-cell">Age</div>
      </div>

      {/* ── WIN RESULT — above the grid ── */}
      {won && (
        <div className="result-banner win-banner">
          <span className="result-icon">⚽</span>
          <h2>GOAL!</h2>
          <p>You identified the player in <strong>{guesses.length}</strong> guess{guesses.length !== 1 ? 'es' : ''}.</p>
          <p className="result-player-name">{targetPlayer.name}</p>
          <button className="replay-btn" onClick={initGame}>Play Again →</button>
        </div>
      )}

      {/* ── FAIL RESULT — above the grid ── */}
      {lost && (
        <div className="result-banner fail-banner">
          <span className="result-icon">🔴</span>
          <h2>FULL TIME</h2>
          <p>Better luck next time. The answer was:</p>
          <p className="result-player-name">{targetPlayer.name}</p>
          <div className="answer-pills">
            <span>{targetPlayer.natCode}</span>
            <span>{targetPlayer.club}</span>
            <span>{targetPlayer.pos}</span>
            <span>{targetPlayer.league}</span>
            <span>Age {targetPlayer.age}</span>
          </div>
          <button className="replay-btn" onClick={initGame}>Play Again →</button>
        </div>
      )}

      {/* ── GUESS GRID ── */}
      <div className="grid-container">
        {[...guesses].reverse().map((g, rowIdx) => {
          const club   = g.club.trim();
          const league = g.league.trim();

          const isCorrectNat    = g.natCode === targetPlayer.natCode;
          const isCorrectClub   = club       === targetPlayer.club.trim();
          const isCorrectPos    = g.pos      === targetPlayer.pos;
          const isCorrectLeague = league     === targetPlayer.league.trim();
          const isCorrectAge    = g.age      === targetPlayer.age;
          const ageArrow = g.age < targetPlayer.age
            ? '▲ Higher' : g.age > targetPlayer.age ? '▼ Lower' : null;

          return (
            <div key={rowIdx} className="row">

              {/* 1 · Player name card */}
              <div className="box identity reveal">
                <div className="box-inner">
                  <div className="box-front" />
                  <div className="box-back identity-card">
                    <span className="identity-name">{g.name}</span>
                  </div>
                </div>
              </div>

              {/* 2–6 · Attribute tiles, stagger via CSS nth-child */}
              <Tile correct={isCorrectNat}>
                <img className="flag-img"
                  src={`https://flagcdn.com/w160/${getFlagCode(g.natCode)}.png`}
                  alt={g.natCode}
                  onError={e => { e.target.style.display = 'none'; }} />
                <span className="label">{g.natCode}</span>
              </Tile>

              <Tile correct={isCorrectClub}>
                {assetMap.clubs[club]
                  ? <img src={assetMap.clubs[club]} alt={club} />
                  : <span className="label">{club}</span>}
                {assetMap.clubs[club] && <span className="label">{club}</span>}
              </Tile>

              <Tile correct={isCorrectPos}>
                <span className="pos-value">{g.pos}</span>
              </Tile>

              <Tile correct={isCorrectLeague}>
                {assetMap.leagues[league]
                  ? <img src={assetMap.leagues[league]} alt={league} />
                  : <span className="label">{league}</span>}
                {assetMap.leagues[league] && <span className="label">{league}</span>}
              </Tile>

              <Tile correct={isCorrectAge}>
                <span className="age-value">{g.age}</span>
                {ageArrow && <span className="age-arrow">{ageArrow}</span>}
              </Tile>

            </div>
          );
        })}
      </div>

      {/* ── RULES SECTION ── */}
      <section className="rules-section" ref={rulesRef}>
        <div className="rules-inner">
          <p className="rules-eyebrow">How to Play</p>
          <h2 className="rules-title">THE RULES</h2>
          <div className="rules-grid">
            <div className="rule-card">
              <span className="rule-num">01</span>
              <h3>Guess the Player</h3>
              <p>Type any Big 5 league player's name into the search bar and select them from the dropdown.</p>
            </div>
            <div className="rule-card">
              <span className="rule-num">02</span>
              <h3>Read the Tiles</h3>
              <p>Each tile fades in one by one to reveal whether that attribute matches the mystery player.</p>
            </div>
            <div className="rule-card">
              <span className="rule-num">03</span>
              <h3>Green = Correct</h3>
              <p>A <span className="hl-green">green</span> tile means that attribute exactly matches the mystery player.</p>
            </div>
            <div className="rule-card">
              <span className="rule-num">04</span>
              <h3>Red = Wrong</h3>
              <p>A <span className="hl-red">red</span> tile means that attribute does not match. Keep narrowing it down.</p>
            </div>
            <div className="rule-card">
              <span className="rule-num">05</span>
              <h3>Age Arrows</h3>
              <p><span className="hl-arrow">▲ Higher</span> or <span className="hl-arrow">▼ Lower</span> on the age tile guides you toward the correct age.</p>
            </div>
            <div className="rule-card">
              <span className="rule-num">06</span>
              <h3>9 Attempts</h3>
              <p>You have 9 guesses to identify the mystery player. Use the clues wisely!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <p className="footer-made">
          Made with <span>♥</span> by <strong>Yuvi</strong>
        </p>
        <div className="footer-links">
          <a
            className="footer-link"
            href="https://github.com/YuvrajHajari/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub
          </a>
          <a
            className="footer-link linkedin"
            href="https://linkedin.com/in/yuvraj-singh-hajari-b40373277/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}

/* ── Reusable flip tile ── */
function Tile({ correct, children }) {
  return (
    <div className="box reveal">
      <div className="box-inner">
        <div className="box-front" />
        <div className={`box-back ${correct ? 'correct' : 'wrong'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default App;