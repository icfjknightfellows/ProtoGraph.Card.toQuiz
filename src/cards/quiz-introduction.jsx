import React from "react";
import ReactDOM from 'react-dom';


export default class IntroductionCard extends React.Component {
  render() {

    const buttonStyle = {},
      introCardStyle = {},
      introFrontStyle = {};

    this.props.introCardConfigs.start_button_color ? buttonStyle.backgroundColor = this.props.introCardConfigs.start_button_color : undefined;
    this.props.introCardConfigs.start_button_text_color ? buttonStyle.color = this.props.introCardConfigs.start_button_text_color : undefined;

    introCardStyle.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, 160, 0, 1)`;

    if(this.props.introCardConfigs.background_image) {
      introFrontStyle.backgroundImage = "url(" + this.props.introCardConfigs.background_image + ")";
    }

    return (
      <div className="protograph-toQuiz-intro-card" style={introCardStyle}>
        <div className="protograph-toQuiz-content">
          <div className="protograph-toQuiz-intro-front" style={introFrontStyle}>
            <div className="protograph-toQuiz-intro-gradient"></div>
            {
              this.props.isMobile &&
                <div className={`${this.props.introCardConfigs.background_image ? 'protograph-toQuiz-intro-content protograph-toQuiz-with-image' : 'protograph-toQuiz-intro-content'}`}>
                  <div className={`${this.props.introCardConfigs.background_image && this.props.isMobile ? 'protograph-toQuiz-intro-header protograph-toQuiz-with-image' : 'protograph-toQuiz-intro-header'}`}>
                    {this.props.introCardConfigs.quiz_title}
                  </div>
                  <div className={`${this.props.introCardConfigs.background_image && this.props.isMobile ? 'protograph-toQuiz-intro-description protograph-toQuiz-with-image' : 'protograph-toQuiz-intro-description'}`}>
                    {this.props.introCardConfigs.introduction}
                  </div>
                  <div className="protograph-toQuiz-intro-button-div">
                    <button className="protograph-toQuiz-intro-button" onClick={this.props.startQuiz} style={buttonStyle}>
                      {this.props.introCardConfigs.start_button_text}
                    </button>
                  </div>
                </div>
            }
            <div className="protograph-toQuiz-credits" id="credits"><a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a></div>
          </div>
          <div className="protograph-toQuiz-intro-back">
            <div className="protograph-toQuiz-countdown-content">
              <div className="protograph-toQuiz-countdown-text">Starting your quiz in</div>
              <div className="protograph-toQuiz-countdown-counter">3</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

