import React from 'react';
import ReactDOM from 'react-dom';

export default class QuestionCard extends React.Component {
  renderTimer() {
    return (
      <div className="timer">
        <span className="timer-count">
          {`${this.props.timerValue.min}`}:{
            +this.props.timerValue.sec < 6 ? <span className='danger'>{`${this.props.timerValue.sec}`}</span> : `${this.props.timerValue.sec}`
          }
        </span>
        <img className='timer-img' src='./src/images/clock-small.png'/>
      </div>
    )
  }

  render () {
    const correctOption = this.props.cardData.options.filter((e) => { return e.right_or_wrong === true })[0].option;
    return (
      <div
        className={this.props.cardNo === 0 ? 'question-card active' : 'question-card'}
        data-order={this.props.cardNo}
        style={this.props.cardStyle}
        data-card-type={this.props.cardType}
        data-isNavigable='0'
      >
        <div className="content">
          <div
            className="front"
            onTouchStart={ this.props.isMobile && !this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchStart : undefined }
            onTouchMove={ this.props.isMobile && !this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchMove : undefined }
            onTouchEnd={ this.props.isMobile && !this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchEnd : undefined }
            >
            { this.props.cardConfigs.quiz_type === "scoring" && this.props.cardConfigs.timer ? this.renderTimer() : undefined }
            { this.props.cardConfigs.quiz_type === "scoring" && this.props.cardConfigs.timer && !this.props.cardConfigs.flip_card ?
                <div className='timeout-msg'>Timed out!</div>
              :
                undefined
            }
            <div className='question-number'>
              <span className="current-question">{this.props.questionNo}</span>{`/${this.props.totalQuestions}`}
            </div>
            <div className='question'>{this.props.cardData.question}</div>
            {
              this.props.cardConfigs.quiz_type === "scoring" && !this.props.cardConfigs.flip_card ?
                <div id={`title_${(this.props.cardNo + 1)}`} className="title">ANSWER</div>
              :
                undefined
            }
            {
              this.props.cardConfigs.quiz_type === "scoring" && !this.props.cardConfigs.flip_card ?
                <div className="answers-container">
                  <div className="wrong-answer">
                    <span className="option-text"></span>
                    <span className="cross-marker">&#10005;</span>
                  </div>
                  <div id={`correct_answer${(this.props.cardNo + 1)}`} className="correct-answer">
                    <span className="option-text">{correctOption}</span>
                    <span className="tick-marker">&#10003;</span>
                  </div>
                </div>
              :
                <div className="answers-container">
                  <div className="correct-answer"></div>
                </div>
            }
            <div className='option-container'>
              {
                this.props.cardData.options.map((d, i) => {
                  return <div
                    key={i}
                    data-option-id={i}
                    className="option-div"
                    onClick={this.props.cardEvents.optionClick}>
                      {d.option}
                  </div>
                })
              }
            </div>
            {
              this.props.isMobile ?
                <div className="swipe-hint-container" id="swipe_hint_container">
                  <div className="swipe-hint-animation" id="swipe_hint_animation">
                    <img src='./src/images/swipe-up.gif' />
                  </div>
                  <div className="swipe-hint-msg" id="swipe_hint_msg">Swipe up for next question</div>
                </div>
              :
                <div className="next-container">
                  <span id="next" className="next" onClick={(e) => this.props.cardEvents.nextCard(e)}>Next</span>
                </div>
            }
            <div className="progress-bar">
              <div className="progress-indicator" style={{width: (+this.props.questionNo * 100 / +this.props.totalQuestions) + "%"  }}></div>
            </div>
            <div id="credits" className="credits" >
              <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
            </div>
          </div>
          {
            this.props.cardConfigs.flip_card &&
              <div
                className="back"
                onTouchStart={ this.props.isMobile && this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchStart : undefined }
                onTouchMove={ this.props.isMobile && this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchMove : undefined }
                onTouchEnd={ this.props.isMobile && this.props.cardConfigs.flip_card ? this.props.cardEvents.onTouchEnd : undefined }
                >
                 { this.props.cardConfigs.quiz_type === "scoring" && this.props.cardConfigs.timer &&
                      <div className='timeout-msg'>Timed out!</div>
                  }
                <div className='question-number'>
                  <span className="current-question">{this.props.questionNo}</span>{`/${this.props.totalQuestions}`}
                </div>
                <div className="title">
                  {this.props.cardData.question}
                </div>
                <div className="gif-div">
                  <img className="gif" />
                </div>
                {
                  this.props.cardConfigs.quiz_type === 'scoring' ?
                    <div className="answers-container">
                      <div className="wrong-answer">
                        <span className="option-text"></span>
                        <span className="cross-marker">✕</span>
                      </div>
                      <div className="correct-answer">
                        <span className="option-text">{correctOption}</span>
                        <span className="tick-marker">✓</span>
                      </div>
                    </div>
                  :
                    <div className="answers-container">
                       <div className="correct-answer"></div>
                    </div>
                }
                <div className="clear-both"></div>
                <div className="answer"></div>
                <div className="fact"></div>
                {
                  this.props.isMobile ?
                    <div className="swipe-hint-container" id="swipe_hint_container">
                      <div className="swipe-hint-animation" id="swipe_hint_animation">
                        <img src='./src/images/swipe-up.gif' />
                      </div>
                      <div className="swipe-hint-msg" id="swipe_hint_msg">Swipe up for next question</div>
                    </div>
                  :
                    <div className="next-container">
                      <span id="next" className="next" onClick={(e) => this.props.cardEvents.nextCard(e)}>Next</span>
                    </div>
                }
                <div className="progress-bar">
                  <div className="progress-indicator" style={{width: (+this.props.questionNo * 100 / +this.props.totalQuestions) + "%"  }}></div>
                </div>
                <div id="credits" className="credits" >
                  <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
                </div>
              </div>
          }
        </div>
      </div>
    )
  }
}