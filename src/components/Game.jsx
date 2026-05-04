import { useState } from 'react';
import { BALLS, COLOUR_SEQUENCE, foulValue } from '../gameLogic.js';

const BALL_COLOURS = {
  RED: '#e03030',
  YELLOW: '#f5d020',
  GREEN: '#2e8b2e',
  BROWN: '#8b4513',
  BLUE: '#1a5fb4',
  PINK: '#e8719a',
  BLACK: '#111111',
};

const BALL_TEXT_COLOURS = {
  RED: '#fff',
  YELLOW: '#222',
  GREEN: '#fff',
  BROWN: '#fff',
  BLUE: '#fff',
  PINK: '#fff',
  BLACK: '#fff',
};

export default function Game({ state, dispatch }) {
  const [showFouls, setShowFouls] = useState(false);

  const {
    players,
    currentPlayerIndex,
    frameScores,
    matchScores,
    redsRemaining,
    currentBreak,
    gamePhase,
    nextColourInSequence,
    totalFrames,
  } = state;

  const currentPlayer = players[currentPlayerIndex];
  const opponent = players[1 - currentPlayerIndex];

  const foulBalls = ['RED', 'YELLOW', 'GREEN', 'BROWN', 'BLUE', 'PINK', 'BLACK'];

  return (
    <div className="game-screen">
      {/* Match info bar */}
      <div className="match-bar">
        <span className="match-label">Best of {totalFrames}</span>
        <span className="frames-won">
          {players[0]}: {matchScores[0]} — {players[1]}: {matchScores[1]}
        </span>
      </div>

      {/* Scoreboard */}
      <div className="scoreboard">
        <div className={`player-panel${currentPlayerIndex === 0 ? ' active' : ''}`}>
          <div className="player-name">{players[0]}</div>
          <div className="player-score">{frameScores[0]}</div>
          {currentPlayerIndex === 0 && <div className="turn-indicator">▶ At table</div>}
        </div>
        <div className="score-divider">
          <div className="reds-remaining">
            <span className="reds-label">Reds left</span>
            <span className="reds-count">{redsRemaining}</span>
          </div>
          <div className="break-info">
            <span className="break-label">Break</span>
            <span className="break-score">{currentBreak}</span>
          </div>
        </div>
        <div className={`player-panel${currentPlayerIndex === 1 ? ' active' : ''}`}>
          <div className="player-name">{players[1]}</div>
          <div className="player-score">{frameScores[1]}</div>
          {currentPlayerIndex === 1 && <div className="turn-indicator">▶ At table</div>}
        </div>
      </div>

      {/* Phase label */}
      <div className="phase-label">
        {gamePhase === 'red' && `${currentPlayer} — pot a red`}
        {gamePhase === 'colour' && `${currentPlayer} — pot a colour (returns to table)`}
        {gamePhase === 'endSequence' && `${currentPlayer} — pot ${BALLS[COLOUR_SEQUENCE[nextColourInSequence]].name}`}
      </div>

      {/* Ball buttons */}
      <div className="ball-buttons">
        {gamePhase === 'red' && (
          <BallButton ballKey="RED" onClick={() => dispatch({ type: 'POT_RED' })} />
        )}

        {gamePhase === 'colour' && COLOUR_SEQUENCE.map(key => (
          <BallButton
            key={key}
            ballKey={key}
            onClick={() => dispatch({ type: 'POT_COLOUR', ballKey: key })}
          />
        ))}

        {gamePhase === 'endSequence' && (
          <BallButton
            ballKey={COLOUR_SEQUENCE[nextColourInSequence]}
            onClick={() => dispatch({ type: 'POT_END_SEQUENCE' })}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button className="miss-btn" onClick={() => dispatch({ type: 'MISS' })}>
          Miss / Safety
        </button>
        <button
          className={`foul-toggle-btn${showFouls ? ' active' : ''}`}
          onClick={() => setShowFouls(v => !v)}
        >
          {showFouls ? 'Hide Fouls' : 'Foul ▼'}
        </button>
        <button className="concede-btn" onClick={() => dispatch({ type: 'CONCEDE_FRAME' })}>
          Concede Frame
        </button>
      </div>

      {/* Foul buttons */}
      {showFouls && (
        <div className="foul-panel">
          <div className="foul-title">Foul on ball — opponent gets max(4, value) pts:</div>
          <div className="foul-buttons">
            {foulBalls.map(key => (
              <button
                key={key}
                className="foul-btn"
                style={{ background: BALL_COLOURS[key], color: BALL_TEXT_COLOURS[key] }}
                onClick={() => {
                  dispatch({ type: 'FOUL', ballKey: key });
                  setShowFouls(false);
                }}
              >
                {BALLS[key].name} (+{foulValue(key)})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BallButton({ ballKey, onClick }) {
  return (
    <button
      className="ball-btn"
      style={{ background: BALL_COLOURS[ballKey], color: BALL_TEXT_COLOURS[ballKey] }}
      onClick={onClick}
    >
      <span className="ball-name">{BALLS[ballKey].name}</span>
      <span className="ball-value">{BALLS[ballKey].value} pt{BALLS[ballKey].value !== 1 ? 's' : ''}</span>
    </button>
  );
}
