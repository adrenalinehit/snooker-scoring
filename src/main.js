import './style.css';
import {
  BALL_VALUES,
  COLOR_ORDER,
  MAX_REDS,
  getFrameState,
} from './snooker.js';

// ─── State ───────────────────────────────────────────────────────────────────

const state = {
  player1Name: 'Player 1',
  player2Name: 'Player 2',
  player1Score: 0,
  player2Score: 0,
  activePlayer: 1,           // 1 or 2 — whose score the ball buttons affect
  redsOnTable: MAX_REDS,
  // During reds phase all colours are always on the table (re-spotted).
  // During colours phase (reds=0) the user ticks off colours as they're potted.
  colorsOnTable: [...COLOR_ORDER],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addScore(player, pts) {
  const key = `player${player}Score`;
  state[key] = Math.max(0, state[key] + pts);
  render();
}

function setActivePlayer(player) {
  state.activePlayer = player;
  render();
}

function changeReds(delta) {
  state.redsOnTable = Math.max(0, Math.min(MAX_REDS, state.redsOnTable + delta));
  // When reds are present all colours are re-spotted → reset to full set
  if (state.redsOnTable > 0) {
    state.colorsOnTable = [...COLOR_ORDER];
  }
  render();
}

function toggleColor(color) {
  if (state.redsOnTable > 0) return; // colours always on table during reds phase
  if (state.colorsOnTable.includes(color)) {
    state.colorsOnTable = state.colorsOnTable.filter(c => c !== color);
  } else {
    // Re-add in original order
    state.colorsOnTable = COLOR_ORDER.filter(c =>
      state.colorsOnTable.includes(c) || c === color
    );
  }
  render();
}

function resetFrame() {
  state.player1Score = 0;
  state.player2Score = 0;
  state.redsOnTable = MAX_REDS;
  state.colorsOnTable = [...COLOR_ORDER];
  state.activePlayer = 1;
  render();
}

// ─── Rendering ───────────────────────────────────────────────────────────────

function renderPips(total) {
  return Array.from({ length: MAX_REDS }, (_, i) =>
    `<span class="pip${i >= total ? ' empty' : ''}"></span>`
  ).join('');
}

function renderStatItem(label, value, cssClass = '', sub = '', right = false) {
  return `
    <div class="stat-item${right ? ' right' : ''}">
      <div class="stat-label">${label}</div>
      <div class="stat-value${cssClass ? ' ' + cssClass : ''}">${value}</div>
      ${sub ? `<div class="stat-sub">${sub}</div>` : ''}
    </div>`;
}

function render() {
  const fs = getFrameState({
    player1Score: state.player1Score,
    player2Score: state.player2Score,
    redsOnTable: state.redsOnTable,
    colorsOnTable: state.colorsOnTable,
  });

  const p1Name = state.player1Name || 'Player 1';
  const p2Name = state.player2Name || 'Player 2';
  const activeName = state.activePlayer === 1 ? p1Name : p2Name;

  // ── Frame-over banner ──────────────────────────────────────────────
  let frameOverHtml = '';
  if (fs.isFrameOver) {
    if (fs.winner === 'tied') {
      frameOverHtml = `
        <div class="frame-over-banner">
          🎱 Frame over — <span class="winner-name">It's a tie!</span>
          (Black ball re-spotted)
        </div>`;
    } else {
      const winnerName = fs.winner === 'player1' ? p1Name : p2Name;
      const winnerScore = fs.winner === 'player1' ? state.player1Score : state.player2Score;
      const loserScore  = fs.winner === 'player1' ? state.player2Score : state.player1Score;
      frameOverHtml = `
        <div class="frame-over-banner">
          🏆 Frame won by
          <span class="winner-name">${winnerName}</span>
          ${winnerScore} – ${loserScore}
        </div>`;
    }
  }

  // ── Player stats helpers ───────────────────────────────────────────
  function playerNeedsHtml(pointsNeeded, canWin, snookersNeeded) {
    if (pointsNeeded === 0) {
      return `<span class="stat-value positive">Leading</span>`;
    }
    if (canWin) {
      return `<span class="stat-value warning">${pointsNeeded} pts needed</span>`;
    }
    return `
      <span class="stat-value danger">${pointsNeeded} pts needed</span>
      <span class="snooker-badge">+${snookersNeeded} snooker${snookersNeeded !== 1 ? 's' : ''}</span>`;
  }

  function playerMaxHtml(playerScore, maxRemaining) {
    return `<span class="stat-value">${playerScore + maxRemaining}</span>
            <div class="stat-sub">max possible</div>`;
  }

  // ── Colour toggles ─────────────────────────────────────────────────
  const colorsDisabled = state.redsOnTable > 0;
  const colorTogglesHtml = COLOR_ORDER.map(color => {
    const checked = state.colorsOnTable.includes(color);
    const val = BALL_VALUES[color];
    return `
      <label class="color-toggle" data-color="${color}">
        <input type="checkbox" ${checked ? 'checked' : ''} ${colorsDisabled ? 'disabled' : ''} />
        <span class="color-ball ball-${color}">${val}</span>
        <span class="color-name">${color}</span>
      </label>`;
  }).join('');

  const colorsNoteHtml = colorsDisabled
    ? `<p class="colors-note">All colours on table while reds remain</p>`
    : `<p class="colors-note">Tap a colour to mark it as potted</p>`;

  // ── Full HTML ──────────────────────────────────────────────────────
  document.getElementById('app').innerHTML = `
    <div class="app">
      <header class="app-header">
        <h1>🎱 Snooker Scorer</h1>
        <p>Live frame calculator</p>
      </header>

      ${frameOverHtml}

      <!-- Scores -->
      <div class="card">
        <div class="card-title">Scores — tap a player to select</div>
        <div class="scores-grid">
          <div class="player-card${state.activePlayer === 1 ? ' active' : ''}" data-player="1">
            <input class="player-name-input" type="text" value="${p1Name}" placeholder="Player 1"
                   data-name="1" maxlength="20" />
            <div class="player-score">${state.player1Score}</div>
            <div class="score-adj-row">
              <button class="btn-adj btn-minus" data-adj-player="1" data-pts="-1">−1</button>
            </div>
          </div>
          <div class="player-card${state.activePlayer === 2 ? ' active' : ''}" data-player="2">
            <input class="player-name-input" type="text" value="${p2Name}" placeholder="Player 2"
                   data-name="2" maxlength="20" />
            <div class="player-score">${state.player2Score}</div>
            <div class="score-adj-row">
              <button class="btn-adj btn-minus" data-adj-player="2" data-pts="-1">−1</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Ball buttons -->
      <div class="card">
        <div class="card-title">Add points to: <span style="color:var(--green-dark)">${activeName}</span></div>
        <div class="ball-buttons-section">
          <div class="ball-row">
            <button class="btn-ball ball-red"    data-ball="1">1</button>
            <button class="btn-ball ball-yellow" data-ball="2">2</button>
            <button class="btn-ball ball-green"  data-ball="3">3</button>
            <button class="btn-ball ball-brown"  data-ball="4">4</button>
            <button class="btn-ball ball-blue"   data-ball="5">5</button>
            <button class="btn-ball ball-pink"   data-ball="6">6</button>
            <button class="btn-ball ball-black"  data-ball="7">7</button>
          </div>
        </div>
      </div>

      <!-- Table configuration -->
      <div class="card">
        <div class="card-title">Table Configuration</div>
        <div class="reds-control">
          <span class="reds-label">Reds left</span>
          <button class="btn-stepper" id="reds-minus" ${state.redsOnTable === 0 ? 'disabled' : ''}>−</button>
          <span class="reds-value">${state.redsOnTable}</span>
          <button class="btn-stepper" id="reds-plus"  ${state.redsOnTable === MAX_REDS ? 'disabled' : ''}>+</button>
          <div class="reds-pips">${renderPips(state.redsOnTable)}</div>
        </div>

        <div class="card-title" style="margin-top:4px">Colours on table</div>
        <div class="colors-grid" id="colors-grid">
          ${colorTogglesHtml}
        </div>
        ${colorsNoteHtml}
      </div>

      <!-- Frame statistics -->
      <div class="card">
        <div class="card-title">Frame Statistics</div>
        <div class="remaining-banner">
          <div class="rem-label">Max points remaining</div>
          <div class="rem-value">${fs.maxRemaining}</div>
          <div class="rem-sub">of 147 total</div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">${p1Name}</div>
            ${playerNeedsHtml(fs.p1PointsNeeded, fs.p1CanWin, fs.p1SnookersNeeded)}
          </div>
          <div class="stat-item right">
            <div class="stat-label">${p2Name}</div>
            ${playerNeedsHtml(fs.p2PointsNeeded, fs.p2CanWin, fs.p2SnookersNeeded)}
          </div>
          <div class="stat-item">
            <div class="stat-label">Max for ${p1Name}</div>
            ${playerMaxHtml(state.player1Score, fs.maxRemaining)}
          </div>
          <div class="stat-item right">
            <div class="stat-label">Max for ${p2Name}</div>
            ${playerMaxHtml(state.player2Score, fs.maxRemaining)}
          </div>
        </div>
      </div>

      <button class="btn-reset" id="btn-reset">🔄 New Frame</button>
    </div>
  `;

  // ── Event listeners ────────────────────────────────────────────────

  // Player card click → set active player
  document.querySelectorAll('.player-card').forEach(card => {
    card.addEventListener('click', e => {
      // Don't trigger when clicking name input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
      setActivePlayer(Number(card.dataset.player));
    });
  });

  // Player name inputs
  document.querySelectorAll('[data-name]').forEach(input => {
    input.addEventListener('input', e => {
      state[`player${e.target.dataset.name}Name`] = e.target.value;
      // Don't re-render on every keystroke to avoid losing focus
      // Just update the ball-buttons label
      const activeName = state.activePlayer === 1
        ? (state.player1Name || 'Player 1')
        : (state.player2Name || 'Player 2');
      const lbl = document.querySelector('.card-title span');
      if (lbl) lbl.textContent = activeName;
    });
    input.addEventListener('blur', () => render());
    // Stop card click propagation
    input.addEventListener('click', e => e.stopPropagation());
  });

  // Ball buttons → add to active player
  document.querySelectorAll('[data-ball]').forEach(btn => {
    btn.addEventListener('click', () => {
      addScore(state.activePlayer, Number(btn.dataset.ball));
    });
  });

  // Score adjust buttons (−1 per player)
  document.querySelectorAll('[data-adj-player]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addScore(Number(btn.dataset.adjPlayer), Number(btn.dataset.pts));
    });
  });

  // Reds steppers
  document.getElementById('reds-minus')?.addEventListener('click', () => changeReds(-1));
  document.getElementById('reds-plus')?.addEventListener('click',  () => changeReds(+1));

  // Colour toggles
  document.querySelectorAll('[data-color]').forEach(label => {
    label.addEventListener('click', e => {
      e.preventDefault();
      toggleColor(label.dataset.color);
    });
  });

  // New frame
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    if (confirm('Start a new frame? Scores will be reset.')) {
      resetFrame();
    }
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
render();
