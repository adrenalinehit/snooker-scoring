import { useState } from 'react';
import { FRAME_OPTIONS } from '../gameLogic.js';

export default function Setup({ onStart }) {
  const [player1, setPlayer1] = useState('Player 1');
  const [player2, setPlayer2] = useState('Player 2');
  const [frames, setFrames] = useState(5);

  function handleSubmit(e) {
    e.preventDefault();
    if (!player1.trim() || !player2.trim()) return;
    onStart(player1.trim(), player2.trim(), frames);
  }

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <div className="logo">🎱</div>
        <h1>Snooker Scorer</h1>
        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label>Player 1</label>
            <input
              type="text"
              value={player1}
              onChange={e => setPlayer1(e.target.value)}
              maxLength={24}
              required
            />
          </div>
          <div className="form-group">
            <label>Player 2</label>
            <input
              type="text"
              value={player2}
              onChange={e => setPlayer2(e.target.value)}
              maxLength={24}
              required
            />
          </div>
          <div className="form-group">
            <label>Match Format</label>
            <div className="frame-options">
              {FRAME_OPTIONS.map(n => (
                <button
                  key={n}
                  type="button"
                  className={`frame-opt-btn${frames === n ? ' selected' : ''}`}
                  onClick={() => setFrames(n)}
                >
                  Best of {n}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="start-btn">Start Match</button>
        </form>
      </div>
    </div>
  );
}
