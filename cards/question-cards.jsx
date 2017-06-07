import React from 'react';
import ReactDOM from 'react-dom';

export function render (props, state) {
  return (
    <div className="content" >
      <div
        className="front"
        onTouchStart={ props.isMobile && props.cardConfigs.flip_card !== "yes" ? props.cardEvents.onTouchStart : undefined }
        onTouchMove={ props.isMobile && props.cardConfigs.flip_card !== "yes" ? props.cardEvents.onTouchMove : undefined }
        onTouchEnd={ props.isMobile && props.cardConfigs.flip_card !== "yes" ? props.cardEvents.onTouchEnd : undefined }
        >
        <div className='question-number'>
          <span className="current-question">{props.questionNo}</span>{`/${props.totalQuestionCards}`}
        </div>
        <div className='question'>{props.cardData.question}</div>
        <div className='option-container'>
          {
            props.cardData.options.map((d, i) => {
              return <div
                key={i}
                data-option-id={i}
                className="option-div"
                onClick={props.cardEvents.optionClick}>
                  {d.option}
              </div>
            })
          }
        </div>
        {
          props.isMobile ?
          <div className="swipe-hint-container" id="swipe_hint_container">
            <div className="swipe-hint-animation" id="swipe_hint_animation"></div>
            <div className="swipe-hint-msg" id="swipe_hint_msg">Swipe up for next question</div>
          </div> : undefined
        }
        <div className="progress-bar">
          <div className="progress-indicator" style={{width: (+props.questionNo * 100 / +props.totalQuestionCards) + "%"  }}></div>
        </div>
        <div id="credits" className="credits" >
          <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
        </div>
      </div>
      <div
        className="back"
        onTouchStart={ props.isMobile && props.cardConfigs.flip_card === "yes" ? props.cardEvents.onTouchStart : undefined }
        onTouchMove={ props.isMobile && props.cardConfigs.flip_card === "yes" ? props.cardEvents.onTouchMove : undefined }
        onTouchEnd={ props.isMobile && props.cardConfigs.flip_card === "yes" ? props.cardEvents.onTouchEnd : undefined }
        >
        <div className='question-number'>
          <span className="current-question">{props.questionNo}</span>{`/${props.totalQuestionCards}`}
        </div>
        <div className="title">Answer</div>
        <div className="answers-container">
          <div className="wrong-answer">
            <span className="option-text"></span>
            <span className="cross-marker">✕</span>
          </div>
          <div className="correct-answer">
            <span className="option-text">{props.cardData.options.filter((e) => { return e.right_or_wrong === "right" })[0].option}</span>
            <span className="tick-marker">✓</span>
          </div>
        </div>
        <div className="gif-div">
          <img className="gif" />
        </div>
        <div className="clear-both"></div>
        <div className="answer"></div>
        <div className="fact"></div>
        <div className="progress-bar">
          <div className="progress-indicator" style={{width: (+props.questionNo * 100 / +props.totalQuestionCards) + "%"  }}></div>
        </div>
        <div id="credits" className="credits" >
          <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
        </div>
      </div>
    </div>
  )
}