import React from 'react';
import ReactDOM from 'react-dom';

export function render (props, state) {
  return (
    <div className="score-card">
      <div className="score-header">{props.cardData.quiz_title}</div>
      <div className="score-description"></div>
      <div className="reset-button-div">
        <button className="reset-button" ></button>
      </div>
    </div>
  )
}