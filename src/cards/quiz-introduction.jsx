import React from "react";
import ReactDOM from 'react-dom';


export default class IntroductionCard extends React.Component {
  render() {

    const buttonStyle = {},
      introCardStyle = {},
      introFrontStyle = {},
      languageTexts = this.props.languageTexts;

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
                  <h1 className={`${this.props.introCardConfigs.background_image && this.props.isMobile ? 'ui header protograph-toQuiz-intro-header protograph-toQuiz-with-image' : 'protograph-toQuiz-intro-header'}`}>
                    {this.props.introCardConfigs.quiz_title}
                  </h1>
                  <p className={`${this.props.introCardConfigs.background_image && this.props.isMobile ? 'protograph-toQuiz-intro-description protograph-toQuiz-with-image' : 'protograph-toQuiz-intro-description'}`}>
                    {this.props.introCardConfigs.introduction}
                  </p>
                  <div className="protograph-toQuiz-intro-button-div">
                    <button className="protograph-toQuiz-intro-button" onClick={this.props.startQuiz} style={buttonStyle}>
                      {this.props.introCardConfigs.start_button_text}
                    </button>
                  </div>
                </div>
            }
            <div className="protograph-toQuiz-credits" id="credits"><a href={this.props.creditLink} target="blank">{this.props.creditMessage}</a></div>
          </div>
          <div className="protograph-toQuiz-intro-back">
            <div className="protograph-toQuiz-countdown-content">
              <div className="protograph-toQuiz-countdown-text">{languageTexts.starting_quiz}</div>
              <h1 className="ui header protograph-toQuiz-countdown-counter">3</h1>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

