// Pure game logic functions for snooker scoring

export const BALLS = {
  RED: { name: 'Red', value: 1 },
  YELLOW: { name: 'Yellow', value: 2 },
  GREEN: { name: 'Green', value: 3 },
  BROWN: { name: 'Brown', value: 4 },
  BLUE: { name: 'Blue', value: 5 },
  PINK: { name: 'Pink', value: 6 },
  BLACK: { name: 'Black', value: 7 },
};

export const COLOUR_SEQUENCE = ['YELLOW', 'GREEN', 'BROWN', 'BLUE', 'PINK', 'BLACK'];

export const FRAME_OPTIONS = [3, 5, 7, 9];

export function foulValue(ballKey) {
  const val = BALLS[ballKey]?.value ?? 0;
  return Math.max(4, val);
}

export function initialFrameState() {
  return {
    frameScores: [0, 0],
    redsRemaining: 15,
    currentBreak: 0,
    gamePhase: 'red', // 'red' | 'colour' | 'endSequence' | 'frameOver'
    nextColourInSequence: 0, // index into COLOUR_SEQUENCE
    currentPlayerIndex: 0,
  };
}

export function initialState(player1, player2, totalFrames) {
  return {
    players: [player1, player2],
    totalFrames,
    matchScores: [0, 0],
    frameHistory: [],
    currentPlayerIndex: 0,
    ...initialFrameState(),
    gamePhase: 'red',
    matchOver: false,
  };
}

export function potRed(state) {
  if (state.gamePhase !== 'red') return state;
  const scores = [...state.frameScores];
  scores[state.currentPlayerIndex] += 1;
  return {
    ...state,
    frameScores: scores,
    currentBreak: state.currentBreak + 1,
    redsRemaining: state.redsRemaining - 1,
    gamePhase: 'colour',
  };
}

export function potColour(state, ballKey) {
  if (state.gamePhase !== 'colour') return state;
  const val = BALLS[ballKey].value;
  const scores = [...state.frameScores];
  scores[state.currentPlayerIndex] += val;
  const newBreak = state.currentBreak + val;

  // After potting colour in red phase, colour returns to table
  // Determine next phase
  let nextPhase;
  if (state.redsRemaining > 0) {
    nextPhase = 'red';
  } else {
    // All reds gone, start end sequence from yellow
    nextPhase = 'endSequence';
  }

  return {
    ...state,
    frameScores: scores,
    currentBreak: newBreak,
    gamePhase: nextPhase,
    nextColourInSequence: nextPhase === 'endSequence' ? 0 : state.nextColourInSequence,
  };
}

export function potEndSequenceColour(state) {
  if (state.gamePhase !== 'endSequence') return state;
  const ballKey = COLOUR_SEQUENCE[state.nextColourInSequence];
  const val = BALLS[ballKey].value;
  const scores = [...state.frameScores];
  scores[state.currentPlayerIndex] += val;
  const newBreak = state.currentBreak + val;
  const nextColourIndex = state.nextColourInSequence + 1;

  if (nextColourIndex >= COLOUR_SEQUENCE.length) {
    // All balls potted - frame over
    return resolveFrameEnd({ ...state, frameScores: scores, currentBreak: newBreak });
  }

  return {
    ...state,
    frameScores: scores,
    currentBreak: newBreak,
    nextColourInSequence: nextColourIndex,
  };
}

export function miss(state) {
  return switchPlayer({ ...state, currentBreak: 0 });
}

export function foul(state, ballKey) {
  const penalty = foulValue(ballKey);
  const opponent = 1 - state.currentPlayerIndex;
  const scores = [...state.frameScores];
  scores[opponent] += penalty;

  // After foul in endSequence, the ball is still the next in sequence (if not already potted)
  // Turn switches to opponent
  return switchPlayer({ ...state, frameScores: scores, currentBreak: 0 });
}

export function concedeFrame(state) {
  return resolveFrameEnd(state);
}

function switchPlayer(state) {
  // When switching player during colour phase, colour is not potted so we stay in 'red' phase
  // (or endSequence continues from same nextColourInSequence)
  let nextPhase = state.gamePhase;
  if (state.gamePhase === 'colour') {
    // missed/fouled after potting red - colour goes back, red stays off
    nextPhase = state.redsRemaining > 0 ? 'red' : 'endSequence';
  }

  return {
    ...state,
    currentPlayerIndex: 1 - state.currentPlayerIndex,
    gamePhase: nextPhase,
    currentBreak: 0,
  };
}

function resolveFrameEnd(state) {
  const [s0, s1] = state.frameScores;
  let frameWinner = null;
  if (s0 > s1) frameWinner = 0;
  else if (s1 > s0) frameWinner = 1;
  // tie is possible but rare; treat as no winner (re-spot black in real snooker, skip for simplicity)

  const matchScores = [...state.matchScores];
  if (frameWinner !== null) matchScores[frameWinner] += 1;

  const framesToWin = Math.ceil(state.totalFrames / 2);
  const matchOver = matchScores[0] >= framesToWin || matchScores[1] >= framesToWin;

  const frameHistory = [
    ...state.frameHistory,
    { scores: [...state.frameScores], winner: frameWinner },
  ];

  return {
    ...state,
    matchScores,
    frameHistory,
    gamePhase: matchOver ? 'matchOver' : 'frameOver',
    matchOver,
    frameWinner,
  };
}

export function startNextFrame(state) {
  const nextPlayer = state.frameWinner ?? state.currentPlayerIndex;
  return {
    ...state,
    ...initialFrameState(),
    currentPlayerIndex: nextPlayer,
    matchScores: state.matchScores,
    frameHistory: state.frameHistory,
    players: state.players,
    totalFrames: state.totalFrames,
    matchOver: false,
    frameWinner: null,
  };
}
