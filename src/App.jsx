import { useReducer } from 'react';
import Setup from './components/Setup.jsx';
import Game from './components/Game.jsx';
import FrameResult from './components/FrameResult.jsx';
import {
  initialState,
  potRed,
  potColour,
  potEndSequenceColour,
  miss,
  foul,
  concedeFrame,
  startNextFrame,
} from './gameLogic.js';
import './App.css';

function reducer(state, action) {
  switch (action.type) {
    case 'START_MATCH':
      return initialState(action.player1, action.player2, action.totalFrames);
    case 'POT_RED':
      return potRed(state);
    case 'POT_COLOUR':
      return potColour(state, action.ballKey);
    case 'POT_END_SEQUENCE':
      return potEndSequenceColour(state);
    case 'MISS':
      return miss(state);
    case 'FOUL':
      return foul(state, action.ballKey);
    case 'CONCEDE_FRAME':
      return concedeFrame(state);
    case 'NEXT_FRAME':
      return startNextFrame(state);
    case 'NEW_MATCH':
      return { screen: 'setup' };
    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, { screen: 'setup' });

  function handleStart(player1, player2, totalFrames) {
    dispatch({ type: 'START_MATCH', player1, player2, totalFrames });
  }

  if (!state.screen && (state.gamePhase === 'frameOver' || state.gamePhase === 'matchOver')) {
    return <FrameResult state={state} dispatch={dispatch} />;
  }

  if (!state.screen && state.gamePhase) {
    return <Game state={state} dispatch={dispatch} />;
  }

  return <Setup onStart={handleStart} />;
}
