import React from 'react';
import { ACTIONS } from './App';

function DigitButton({dispatch, digit }) {
  return (
    <button value={digit} onClick={() => {dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit } })}}>
      {digit}
    </button>
  );
}

export default DigitButton;