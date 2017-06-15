import React from "react";
import ReactDOM from 'react-dom';


export default class IntroductionCard extends React.Component {
  render() {
    return (
      <div className="intro-card">
        <div className="content">
          <div className="intro-front">
            <div className="intro-gradient"></div>
            <div className="intro-content">
              <div className="intro-header">{this.props.introCardConfigs.quiz_title}</div>
              <div className="intro-description"></div>
              <div className="intro-button-div">
                <button className="intro-button" onClick={this.props.startQuiz}>{this.props.introCardConfigs.start_button_text}</button>
              </div>
            </div>
            <div className="credits" id="credits"><a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a></div>
          </div>
          <div className="intro-back">
            <div className="countdown-content">
              <div className="countdown-text">Starting your quiz in</div>
              <div className="countdown-counter">3</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

