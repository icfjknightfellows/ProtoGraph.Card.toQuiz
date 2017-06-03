import React from 'react';
import ReactDOM from 'react-dom';

export function render (props, state) {
  return (
    <div className="content" style={{background: 'white'}}>
      <div className="intro-header">{props.cardData.quiz_title}</div>
      <div className="intro-description"></div>
      <div className="intro-button-div">
        <button className="intro-button" onClick={props.cardEvents.startQuiz}>{props.cardData.start_button_text}</button>
      </div>
    </div>
  )
}
