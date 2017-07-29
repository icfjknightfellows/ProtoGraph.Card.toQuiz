import React from 'react';
import ReactDOM from 'react-dom';

export default class QuestionCard extends React.Component {
  renderTimer() {
    return (
      <div className="protograph-toQuiz-timer">
        <span className="protograph-toQuiz-timer-count">
          {`${this.props.timerValue.min}`}:{
            +this.props.timerValue.sec < 6 ? <span className='protograph-toQuiz-danger'>{`${this.props.timerValue.sec}`}</span> : `${this.props.timerValue.sec}`
          }
        </span>
        <img className='protograph-toQuiz-timer-img' src={`${this.props.baseURL}/images/clock-small.png`} />
      </div>
    )
  }

  render () {
    let correctOption, languageTexts = this.props.languageTexts;
    if (this.props.cardConfigs.quiz_type === "scoring") {
      correctOption = this.props.cardData.options.filter((e) => { return e.right_or_wrong === true });
      correctOption = correctOption.length ? correctOption[0].option : undefined;
    }
    return (
      <div
        className={this.props.cardNo === 0 ? 'protograph-toQuiz-question-card protograph-toQuiz-active' : 'protograph-toQuiz-question-card'}
        data-order={this.props.cardNo}
        style={this.props.cardStyle}
        data-card-type={this.props.cardType}
        data-isNavigable='0'
      >
        <div className="protograph-toQuiz-content">
          <div
            className="protograph-toQuiz-front"
            onTouchStart={ this.props.isMobile && !this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchStart : undefined }
            onTouchMove={ this.props.isMobile && !this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchMove : undefined }
            onTouchEnd={ this.props.isMobile && !this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchEnd : undefined }
            onClick={ this.props.isMobile && !this.props.cardConfigs.flip_card ? this.props.cardEvents.nextCard : undefined }
            >
            { this.props.cardConfigs.quiz_type === "scoring" && this.props.cardConfigs.timer ? this.renderTimer() : undefined }
            { this.props.cardConfigs.quiz_type === "scoring" && this.props.cardConfigs.timer && !this.props.cardConfigs.flip_card ?
                <div className='protograph-toQuiz-timeout-msg'>{languageTexts.timed_out}</div>
              :
                undefined
            }
            <div className='protograph-toQuiz-question-number'>
              <span className="protograph-toQuiz-current-question">{this.props.questionNo}</span>{`/${this.props.totalQuestions}`}
            </div>
            <div className='protograph-toQuiz-question'>{this.props.cardData.question}</div>
            {
              this.props.cardConfigs.quiz_type === "scoring" && !this.props.cardConfigs.flip_card ?
                <div id={`title_${(this.props.cardNo + 1)}`} className="protograph-toQuiz-title">{languageTexts.ans_title}</div>
              :
                undefined
            }
            {
              this.props.cardConfigs.quiz_type === "scoring" && !this.props.cardConfigs.flip_card ?
                <div className="protograph-toQuiz-answers-container">
                  <div className="protograph-toQuiz-wrong-answer">
                    <span className="protograph-toQuiz-option-text"></span>
                    <span className="protograph-toQuiz-cross-marker">&#10005;</span>
                  </div>
                  <div id={`correct_answer${(this.props.cardNo + 1)}`} className="protograph-toQuiz-correct-answer">
                    <span className="protograph-toQuiz-option-text">{correctOption}</span>
                    <span className="protograph-toQuiz-tick-marker">&#10003;</span>
                  </div>
                </div>
              :
                <div className="protograph-toQuiz-answers-container">
                  <div className="protograph-toQuiz-correct-answer"></div>
                </div>
            }
            <div className='protograph-toQuiz-option-container'>
              {
                this.props.cardData.options.map((d, i) => {
                  return <div
                    key={i}
                    data-option-id={i}
                    className="protograph-toQuiz-option-div"
                    onClick={this.props.cardEvents.optionClick}>
                      {d.option}
                  </div>
                })
              }
            </div>
            {
              this.props.isMobile ?
                <div className="protograph-toQuiz-swipe-hint-container" id="swipe_hint_container">
                  <div className="protograph-toQuiz-swipe-hint-animation" id="swipe_hint_animation">
                    <img src={`${this.props.baseURL}/images/swipe-up.gif`} />
                  </div>
                  <div className="protograph-toQuiz-swipe-hint-msg" id="swipe_hint_msg">{this.props.languageTexts.swipe}</div>
                </div>
              :
                <div className="protograph-toQuiz-next-container">
                  <span id="next" className="protograph-toQuiz-next" onClick={(e) => this.props.cardEvents.nextCard(e)}>{languageTexts.next}</span>
                </div>
            }
            <div className="protograph-toQuiz-progress-bar">
              <div className="protograph-toQuiz-progress-indicator" style={{width: (+this.props.questionNo * 100 / +this.props.totalQuestions) + "%"  }}></div>
            </div>
            <div id="credits" className="protograph-toQuiz-credits" >
              <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
            </div>
          </div>
          {
            !(this.props.cardConfigs.quiz_type === "scoring" && !this.props.cardConfigs.flip_card) &&
              <div
                className="protograph-toQuiz-back"
                onTouchStart={ this.props.isMobile && this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchStart : undefined }
                onTouchMove={ this.props.isMobile && this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchMove : undefined }
                onTouchEnd={ this.props.isMobile && this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchEnd : undefined }
                onClick={ this.props.isMobile && this.props.cardConfigs.flip_card ? this.props.cardEvents.nextCard : undefined }
                >
                 { this.props.cardConfigs.quiz_type === "scoring" && this.props.cardConfigs.timer &&
                      <div className='protograph-toQuiz-timeout-msg'>{languageTexts.timed_out}</div>
                  }
                <div className='protograph-toQuiz-question-number'>
                  <span className="protograph-toQuiz-current-question">{this.props.questionNo}</span>{`/${this.props.totalQuestions}`}
                </div>
                <div className="protograph-toQuiz-title">
                  {this.props.cardData.question}
                </div>
                <div className="protograph-toQuiz-gif-div">
                  <img className="protograph-toQuiz-gif" />
                </div>
                {
                  this.props.cardConfigs.quiz_type === 'scoring' ?
                    <div className="protograph-toQuiz-answers-container">
                      <div className="protograph-toQuiz-wrong-answer">
                        <span className="protograph-toQuiz-option-text"></span>
                        <span className="protograph-toQuiz-cross-marker">✕</span>
                      </div>
                      <div className="protograph-toQuiz-correct-answer">
                        <span className="protograph-toQuiz-option-text">{correctOption}</span>
                        <span className="protograph-toQuiz-tick-marker">✓</span>
                      </div>
                    </div>
                  :
                    <div className="protograph-toQuiz-answers-container">
                       <div className="protograph-toQuiz-correct-answer"></div>
                    </div>
                }
                <div className="protograph-toQuiz-clear-both"></div>
                <div className="protograph-toQuiz-answer"></div>
                <div className="protograph-toQuiz-fact"></div>
                {
                  this.props.isMobile ?
                    <div className="protograph-toQuiz-swipe-hint-container" id="swipe_hint_container">
                      <div className="protograph-toQuiz-swipe-hint-animation" id="swipe_hint_animation">
                        <img src={`${this.props.baseURL}/images/swipe-up.gif`} />
                      </div>
                      <div className="protograph-toQuiz-swipe-hint-msg" id="swipe_hint_msg">{this.props.languageTexts.swipe}</div>
                    </div>
                  :
                    <div className="protograph-toQuiz-next-container">
                      <span id="next" className="protograph-toQuiz-next" onClick={(e) => this.props.cardEvents.nextCard(e)}>{languageTexts.next}</span>
                    </div>
                }
                <div className="protograph-toQuiz-progress-bar">
                  <div className="protograph-toQuiz-progress-indicator" style={{width: (+this.props.questionNo * 100 / +this.props.totalQuestions) + "%"  }}></div>
                </div>
                <div id="credits" className="protograph-toQuiz-credits" >
                  <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
                </div>
              </div>
          }
        </div>
      </div>
    )
  }
}