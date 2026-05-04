import { describe, it, expect } from 'vitest';
import {
  BALL_VALUES,
  COLOR_ORDER,
  MAX_REDS,
  COLORS_TOTAL,
  MAX_FRAME_SCORE,
  calculateMaxRemaining,
  calculatePointsNeeded,
  canWinWithoutSnookers,
  calculateSnookersNeeded,
  getFrameState,
} from './snooker.js';

// ─── Constants ────────────────────────────────────────────────────────────────

describe('constants', () => {
  it('has correct ball values', () => {
    expect(BALL_VALUES.red).toBe(1);
    expect(BALL_VALUES.yellow).toBe(2);
    expect(BALL_VALUES.green).toBe(3);
    expect(BALL_VALUES.brown).toBe(4);
    expect(BALL_VALUES.blue).toBe(5);
    expect(BALL_VALUES.pink).toBe(6);
    expect(BALL_VALUES.black).toBe(7);
  });

  it('MAX_REDS is 15', () => {
    expect(MAX_REDS).toBe(15);
  });

  it('COLORS_TOTAL is 27', () => {
    expect(COLORS_TOTAL).toBe(27); // 2+3+4+5+6+7
  });

  it('MAX_FRAME_SCORE is 147', () => {
    expect(MAX_FRAME_SCORE).toBe(147); // 15×8 + 27
  });

  it('COLOR_ORDER lists all six colours in potting order', () => {
    expect(COLOR_ORDER).toEqual(['yellow', 'green', 'brown', 'blue', 'pink', 'black']);
  });
});

// ─── calculateMaxRemaining ────────────────────────────────────────────────────

describe('calculateMaxRemaining', () => {
  const allColors = COLOR_ORDER;

  it('returns 147 at the start of a frame (15 reds, all colours)', () => {
    expect(calculateMaxRemaining(15, allColors)).toBe(147);
  });

  it('decreases correctly as reds are potted', () => {
    // 14 reds: 14×8 + 27 = 112 + 27 = 139
    expect(calculateMaxRemaining(14, allColors)).toBe(139);
    // 1 red: 1×8 + 27 = 35
    expect(calculateMaxRemaining(1, allColors)).toBe(35);
  });

  it('returns 27 when last red has just been cleared (0 reds, all colours)', () => {
    expect(calculateMaxRemaining(0, allColors)).toBe(27);
  });

  it('ignores the colorsOnTable array when reds > 0', () => {
    // Even with an empty colorsOnTable, remaining should still count all colours
    // because colours are re-spotted during the reds phase
    expect(calculateMaxRemaining(5, [])).toBe(5 * 8 + 27);
  });

  it('sums only the provided colours when reds === 0', () => {
    expect(calculateMaxRemaining(0, ['pink', 'black'])).toBe(6 + 7); // 13
    expect(calculateMaxRemaining(0, ['black'])).toBe(7);
    expect(calculateMaxRemaining(0, [])).toBe(0);
  });
});

// ─── calculatePointsNeeded ────────────────────────────────────────────────────

describe('calculatePointsNeeded', () => {
  it('returns 0 when player is already winning', () => {
    expect(calculatePointsNeeded(50, 30)).toBe(0);
  });

  it('returns 0 when scores are level', () => {
    expect(calculatePointsNeeded(40, 40)).toBe(0);
  });

  it('returns the correct deficit + 1 when player is behind', () => {
    // Needs 21 pts to go from 30 to 51 (opponent on 50)
    expect(calculatePointsNeeded(30, 50)).toBe(21);
    expect(calculatePointsNeeded(0, 100)).toBe(101);
    expect(calculatePointsNeeded(0, 1)).toBe(2);
  });
});

// ─── canWinWithoutSnookers ────────────────────────────────────────────────────

describe('canWinWithoutSnookers', () => {
  it('returns true when maxRemaining covers the deficit', () => {
    // Behind by 10; 20 pts left → can win
    expect(canWinWithoutSnookers(30, 40, 20)).toBe(true);
  });

  it('returns true when player is already winning', () => {
    expect(canWinWithoutSnookers(60, 40, 5)).toBe(true);
  });

  it('returns true when exactly enough points remain', () => {
    // Behind by 10; needs 11; exactly 11 left
    expect(canWinWithoutSnookers(30, 40, 11)).toBe(true);
  });

  it('returns false when not enough points remain', () => {
    // Behind by 10; needs 11; only 10 left
    expect(canWinWithoutSnookers(30, 40, 10)).toBe(false);
    expect(canWinWithoutSnookers(0, 50, 49)).toBe(false);
  });
});

// ─── calculateSnookersNeeded ──────────────────────────────────────────────────

describe('calculateSnookersNeeded', () => {
  it('returns 0 when the player can already win without snookers', () => {
    expect(calculateSnookersNeeded(40, 40, 20)).toBe(0);
    expect(calculateSnookersNeeded(50, 30, 5)).toBe(0);
  });

  it('returns 0 when exactly enough points remain', () => {
    expect(calculateSnookersNeeded(30, 40, 11)).toBe(0);
  });

  it('calculates snookers needed based on 4-pt minimum foul', () => {
    // Needs 11, only 10 available → shortfall 1 → ceil(1/4) = 1
    expect(calculateSnookersNeeded(30, 40, 10)).toBe(1);
    // Needs 21, only 10 available → shortfall 11 → ceil(11/4) = 3
    expect(calculateSnookersNeeded(0, 20, 10)).toBe(3);
    // Needs 101, 0 available → shortfall 101 → ceil(101/4) = 26
    expect(calculateSnookersNeeded(0, 100, 0)).toBe(26);
  });
});

// ─── getFrameState ────────────────────────────────────────────────────────────

describe('getFrameState', () => {
  it('returns correct state at the start of a frame', () => {
    const state = getFrameState({
      player1Score: 0,
      player2Score: 0,
      redsOnTable: 15,
      colorsOnTable: COLOR_ORDER,
    });

    expect(state.maxRemaining).toBe(147);
    expect(state.p1PointsNeeded).toBe(0); // level → 0
    expect(state.p2PointsNeeded).toBe(0);
    expect(state.p1CanWin).toBe(true);
    expect(state.p2CanWin).toBe(true);
    expect(state.p1SnookersNeeded).toBe(0);
    expect(state.p2SnookersNeeded).toBe(0);
    expect(state.isFrameOver).toBe(false);
    expect(state.winner).toBe(null);
  });

  it('shows player1 winning at the end of the frame', () => {
    const state = getFrameState({
      player1Score: 80,
      player2Score: 60,
      redsOnTable: 0,
      colorsOnTable: [],
    });

    expect(state.maxRemaining).toBe(0);
    expect(state.isFrameOver).toBe(true);
    expect(state.winner).toBe('player1');
  });

  it('shows player2 winning at the end of the frame', () => {
    const state = getFrameState({
      player1Score: 40,
      player2Score: 75,
      redsOnTable: 0,
      colorsOnTable: [],
    });

    expect(state.winner).toBe('player2');
  });

  it('shows tied when scores are equal and no balls remain', () => {
    const state = getFrameState({
      player1Score: 50,
      player2Score: 50,
      redsOnTable: 0,
      colorsOnTable: [],
    });

    expect(state.winner).toBe('tied');
  });

  it('player2 requires snookers mid-frame', () => {
    // P1: 100, P2: 40 – P2 needs 61, only 13 remain (pink + black)
    const state = getFrameState({
      player1Score: 100,
      player2Score: 40,
      redsOnTable: 0,
      colorsOnTable: ['pink', 'black'],
    });

    expect(state.p2CanWin).toBe(false);
    expect(state.p2SnookersNeeded).toBe(Math.ceil((61 - 13) / 4)); // ceil(48/4) = 12
    expect(state.p2PointsNeeded).toBe(61);
  });

  it('player1 needs no snookers when leading', () => {
    const state = getFrameState({
      player1Score: 70,
      player2Score: 50,
      redsOnTable: 0,
      colorsOnTable: ['blue'],
    });

    expect(state.p1PointsNeeded).toBe(0);
    expect(state.p1SnookersNeeded).toBe(0);
    expect(state.p1CanWin).toBe(true);
  });
});
