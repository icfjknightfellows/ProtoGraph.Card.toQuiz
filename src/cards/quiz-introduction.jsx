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
      <div className="intro-card" style={introCardStyle}>
        <div className="content">
          <div className="intro-front" style={introFrontStyle}>
            <div className="intro-gradient"></div>
            {
              this.props.isMobile &&
                <div className={`${this.props.introCardConfigs.background_image ? 'intro-content with-image' : 'intro-content'}`}>
                  <div className={`${this.props.introCardConfigs.background_image && this.props.isMobile ? 'intro-header with-image' : 'intro-header'}`}>
                    {this.props.introCardConfigs.quiz_title}
                  </div>
                  <div className={`${this.props.introCardConfigs.background_image && this.props.isMobile ? 'intro-description with-image' : 'intro-description'}`}>
                    {this.props.introCardConfigs.introduction}
                  </div>
                  <div className="intro-button-div">
                    <button className="intro-button" onClick={this.props.startQuiz} style={buttonStyle}>
                      {this.props.introCardConfigs.start_button_text}
                    </button>
                  </div>
                </div>
            }
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

