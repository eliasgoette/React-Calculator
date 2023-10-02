import React, { useEffect, useReducer } from 'react';
import './style.css';
import OperationButton from './OperationButton';
import DigitButton from './DigitButton';

const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  REMOVE_DIGIT: 'remove-digit',
  EVALUATE: 'evaluate'
}

function reducer(state, {type, payload}) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if(state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false
        }
      }

      if(payload.digit === '0' && state.currentOperand === '0')
        return state;
      
      if(payload.digit === '.' && state.currentOperand !== undefined && state.currentOperand.includes('.'))
        return state;
      
      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${payload.digit}`
      }
    
    case ACTIONS.CHOOSE_OPERATION:
      if(state.currentOperand == null && state.previousOperand == null)
        return state;

      if(state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation
        }
      }

      if(state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null
        }
      }

      return {
        ...state,
        operation: payload.operation,
        previousOperand: evaluate(state),
        currentOperand: null
      }
    
    case ACTIONS.CLEAR:
      return {}

    case ACTIONS.REMOVE_DIGIT:
      if(state.overwrite) {
        return {
          ...state,
          currentOperand: null,
          overwrite: false
        }
      }

      if(state.currentOperand == null) return state;

      if(state.currentOperand.length === 1)
        return {...state, currentOperand: null}

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      }
    
    case ACTIONS.EVALUATE:
      if(state.previousOperand == null || state.currentOperand == null || state.operation == null) {
        return state;
      }

      return {
        ...state,
        operation: null,
        previousOperand: null,
        currentOperand: evaluate(state),
        overwrite: true
      }

    default:
      return state;
  }
}

function evaluate({previousOperand, currentOperand, operation}) {
  const prev = parseFloat(previousOperand);
  const curr = parseFloat(currentOperand);
  if(isNaN(prev) || isNaN(curr)) return '';

  let computation;

  switch(operation){
    case '+':
      computation = prev + curr;
      break;

    case '-':
      computation = prev - curr;
      break;

    case '*':
      computation = prev * curr;
      break;

    case '/':
      computation = prev / curr;
      break;

    default:
      computation = '';
      break;
  }

  return computation.toString();
}

const INTEGER_FORMATTER = new Intl.NumberFormat('en-us', {maximumFractionDigits: 0});

function formatOperand(operand) {
  if(operand == null) return;

  const [integer, decimal] = operand.split('.');

  if(decimal == null) return INTEGER_FORMATTER.format(integer);

  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`;
}

function App() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if(! isNaN(e.key) || e.key === '.') {
        focusButton(e.key);
        return dispatch({type: ACTIONS.ADD_DIGIT, payload: {digit: e.key}});
      }

      if(e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        focusButton(e.key);
        return dispatch({type: ACTIONS.CHOOSE_OPERATION, payload: {operation: e.key}});
      }

      if(e.key === '=' || e.key.toUpperCase() === 'ENTER') {
        focusButton('=');
        return dispatch({type: ACTIONS.EVALUATE});
      }

      if(e.key.toUpperCase() === 'ESCAPE') {
        focusButton('CE');
        return dispatch({type: ACTIONS.CLEAR});
      }

      if(e.key.toUpperCase() === 'BACKSPACE') {
        focusButton('C');
        return dispatch({type: ACTIONS.REMOVE_DIGIT});
      }
    };

    const focusButton = (key) => {
      let buttonForKey = document.querySelector(`button[value='${key}']`);

      if(buttonForKey !== null) {
        buttonForKey.focus();
      }
    }
  
    document.querySelector('html').addEventListener('keydown', handleKeyDown);
  
    // Cleanup: Remove the event listener when the component unmounts
    return () => {
      document.querySelector('html').removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Empty dependency array to run this effect only once on component mount  

  const [{previousOperand, currentOperand, operation}, dispatch] = useReducer(reducer, {});

  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">{formatOperand(previousOperand)} {operation}</div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button value="CE" className="span-two" onClick={() => dispatch({type: ACTIONS.CLEAR})}>CE</button>
      <button value="C" onClick={() => dispatch({type: ACTIONS.REMOVE_DIGIT})}>C</button>
      <OperationButton operation="/" dispatch={dispatch} />
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} />
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="+" dispatch={dispatch} />
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <DigitButton digit="0" dispatch={dispatch} />
      <button value="=" className="span-two" onClick={() => dispatch({type: ACTIONS.EVALUATE})}>=</button>
    </div>
  );
}

export default App;
export { ACTIONS };