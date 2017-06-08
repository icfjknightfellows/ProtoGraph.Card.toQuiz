import React from 'react';
import ReactDOM from 'react-dom';

export function render (props, state) {
  return (
    <div className="content" style={{background: 'white'}}>
      <div className='intro-front'>
        <div className="intro-header">{props.introCardConfigs.quiz_title}</div>
        <div className="intro-description"></div>
        <div className="intro-button-div">
          <button className="intro-button" onClick={props.cardEvents.startQuiz}>{props.introCardConfigs.start_button_text}</button>
        </div>
        <div id="credits" className="credits" >
          <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
        </div>
      </div>
      <div className='intro-back'>
        <div className='countdown-content'>
          <div className='countdown-text'>Starting your quiz in</div>
          <div className='countdown-counter'>3</div>
        </div>
      </div>
    </div>
  )
}
