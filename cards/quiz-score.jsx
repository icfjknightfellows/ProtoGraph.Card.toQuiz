import React from 'react';
import ReactDOM from 'react-dom';

export function render (props, state) {
  return (
    <div>
      <div id="result_container" className="result-container">
        <img className="result-img" src="./src/images/cup.png" />
        <div className="result-text">Thank you!</div>
        <div className="result-score">{`${props.rightCounter} / ${+props.totalQuestionCards}`}</div>
      </div>
      <div id="buttons_container" className="buttons-container">
        <div id="revisit" className="revisit card-button">
          <img className="card-button-img" src="./src/images/revisit.png" />
          <div className="card-button-text">Revisit Answers</div>
        </div>

        <div id="replay" className="replay card-button"  onClick={props.cardEvents.resetQuiz}>
          <img className="card-button-img" src="./src/images/replay.png" />
          <div className="card-button-text">Play Again</div>
        </div>

        <div id="share" className="share card-button">
          <img className="card-button-img" src="./src/images/share.png" />
          <div className="card-button-text">Share</div>
        </div>
        <div className="clearfix"></div>
      </div>
      <div className="links-container"></div>
    </div>
  )
}