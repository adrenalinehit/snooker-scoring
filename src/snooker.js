/**
 * Snooker scoring logic
 *
 * Standard snooker rules:
 *  - 15 red balls (1 pt each); each red must be followed by a colour
 *  - Colours (re-spotted while reds remain): yellow=2, green=3, brown=4, blue=5, pink=6, black=7
 *  - When all reds are gone, colours are potted in order and NOT re-spotted
 *  - Maximum possible frame score (15 reds + 15 blacks + all colours) = 147
 */

export const BALL_VALUES = {
  red: 1,
  yellow: 2,
  green: 3,
  brown: 4,
  blue: 5,
  pink: 6,
  black: 7,
};

/** Colours potted in sequence once all reds are cleared */
export const COLOR_ORDER = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];

export const MAX_REDS = 15;
export const COLORS_TOTAL = COLOR_ORDER.reduce((s, c) => s + BALL_VALUES[c], 0); // 27
export const MAX_FRAME_SCORE = MAX_REDS * (1 + BALL_VALUES.black) + COLORS_TOTAL; // 147

/**
 * Calculate the maximum remaining points on the table.
 *
 * During the reds phase (redsOnTable > 0) the maximum assumes every red is
 * followed by the highest-value colour (black).  All six colours then remain
 * for the colours phase.
 *
 * During the colours phase (redsOnTable === 0) only the supplied colorsOnTable
 * remain, so we return their sum.
 *
 * @param {number}   redsOnTable   - Number of reds still on the table (0–15)
 * @param {string[]} colorsOnTable - Colours still on the table
 * @returns {number}
 */
export function calculateMaxRemaining(redsOnTable, colorsOnTable) {
  if (redsOnTable > 0) {
    const redsMax = redsOnTable * (1 + BALL_VALUES.black); // red + black each time
    const colorsMax = COLOR_ORDER.reduce((s, c) => s + BALL_VALUES[c], 0); // all 6 colours
    return redsMax + colorsMax;
  }
  return colorsOnTable.reduce((s, c) => s + (BALL_VALUES[c] ?? 0), 0);
}

/**
 * Points a player needs to take the lead (i.e. overtake their opponent).
 * Returns 0 when the player is already winning or level.
 *
 * @param {number} playerScore
 * @param {number} opponentScore
 * @returns {number}
 */
export function calculatePointsNeeded(playerScore, opponentScore) {
  if (playerScore >= opponentScore) return 0;
  return opponentScore - playerScore + 1;
}

/**
 * Whether the player can still win without requiring any snookers
 * (i.e. the maximum remaining points alone are sufficient).
 *
 * @param {number} playerScore
 * @param {number} opponentScore
 * @param {number} maxRemaining
 * @returns {boolean}
 */
export function canWinWithoutSnookers(playerScore, opponentScore, maxRemaining) {
  return calculatePointsNeeded(playerScore, opponentScore) <= maxRemaining;
}

/**
 * Minimum number of snookers required for the player to win.
 * Each snooker is worth at least 4 points (the minimum foul penalty).
 * Returns 0 when the player can already win without snookers.
 *
 * @param {number} playerScore
 * @param {number} opponentScore
 * @param {number} maxRemaining
 * @returns {number}
 */
export function calculateSnookersNeeded(playerScore, opponentScore, maxRemaining) {
  const needed = calculatePointsNeeded(playerScore, opponentScore);
  if (needed <= maxRemaining) return 0;
  return Math.ceil((needed - maxRemaining) / 4);
}

/**
 * Derive the complete frame state from the current game configuration.
 *
 * @param {{
 *   player1Score: number,
 *   player2Score: number,
 *   redsOnTable:  number,
 *   colorsOnTable: string[],
 * }} gameState
 * @returns {{
 *   maxRemaining: number,
 *   p1PointsNeeded: number,
 *   p2PointsNeeded: number,
 *   p1CanWin: boolean,
 *   p2CanWin: boolean,
 *   p1SnookersNeeded: number,
 *   p2SnookersNeeded: number,
 *   isFrameOver: boolean,
 *   winner: 'player1'|'player2'|'tied'|null,
 * }}
 */
export function getFrameState({ player1Score, player2Score, redsOnTable, colorsOnTable }) {
  const maxRemaining = calculateMaxRemaining(redsOnTable, colorsOnTable);

  const p1PointsNeeded = calculatePointsNeeded(player1Score, player2Score);
  const p2PointsNeeded = calculatePointsNeeded(player2Score, player1Score);

  const p1CanWin = canWinWithoutSnookers(player1Score, player2Score, maxRemaining);
  const p2CanWin = canWinWithoutSnookers(player2Score, player1Score, maxRemaining);

  const p1SnookersNeeded = calculateSnookersNeeded(player1Score, player2Score, maxRemaining);
  const p2SnookersNeeded = calculateSnookersNeeded(player2Score, player1Score, maxRemaining);

  const isFrameOver = maxRemaining === 0;

  let winner = null;
  if (isFrameOver) {
    if (player1Score > player2Score) winner = 'player1';
    else if (player2Score > player1Score) winner = 'player2';
    else winner = 'tied';
  }

  return {
    maxRemaining,
    p1PointsNeeded,
    p2PointsNeeded,
    p1CanWin,
    p2CanWin,
    p1SnookersNeeded,
    p2SnookersNeeded,
    isFrameOver,
    winner,
  };
}
