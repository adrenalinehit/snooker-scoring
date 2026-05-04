export default function FrameResult({ state, dispatch }) {
  const { players, frameScores, matchScores, totalFrames, gamePhase, frameWinner, frameHistory } = state;
  const isMatchOver = gamePhase === 'matchOver';

  const matchWinner = matchScores[0] > matchScores[1] ? players[0] : players[1];
  const framesToWin = Math.ceil(totalFrames / 2);

  return (
    <div className="result-screen">
      <div className="result-card">
        {isMatchOver ? (
          <>
            <div className="result-trophy">🏆</div>
            <h2 className="result-title">Match Over!</h2>
            <p className="result-winner">{matchWinner} wins the match!</p>
            <div className="result-match-score">
              {players[0]} {matchScores[0]} – {matchScores[1]} {players[1]}
            </div>
          </>
        ) : (
          <>
            <div className="result-trophy">🎱</div>
            <h2 className="result-title">Frame Over</h2>
            {frameWinner !== null ? (
              <p className="result-winner">{players[frameWinner]} wins the frame!</p>
            ) : (
              <p className="result-winner">Frame tied!</p>
            )}
            <div className="result-frame-score">
              {players[0]} {frameScores[0]} – {frameScores[1]} {players[1]}
            </div>
          </>
        )}

        {/* Match score */}
        <div className="result-match-tally">
          <span className="tally-label">Match score:</span>
          <span>{players[0]} {matchScores[0]} – {matchScores[1]} {players[1]}</span>
          <span className="tally-sub">First to {framesToWin} frames wins</span>
        </div>

        {/* Frame history */}
        {frameHistory.length > 0 && (
          <div className="frame-history">
            <div className="history-title">Frame history</div>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Frame</th>
                  <th>{players[0]}</th>
                  <th>{players[1]}</th>
                </tr>
              </thead>
              <tbody>
                {frameHistory.map((f, i) => (
                  <tr key={i} className={f.winner === 0 ? 'win-left' : f.winner === 1 ? 'win-right' : ''}>
                    <td>{i + 1}</td>
                    <td>{f.scores[0]}{f.winner === 0 ? ' ✓' : ''}</td>
                    <td>{f.scores[1]}{f.winner === 1 ? ' ✓' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isMatchOver && (
          <button className="next-frame-btn" onClick={() => dispatch({ type: 'NEXT_FRAME' })}>
            Start Next Frame →
          </button>
        )}
        <button className="new-match-btn" onClick={() => dispatch({ type: 'NEW_MATCH' })}>
          New Match
        </button>
      </div>
    </div>
  );
}
