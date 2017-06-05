import React from 'react';
import ReactDOM from 'react-dom';

export function render (props, state) {
  return (
    <div className="content" id={ 'content_' + props.cardOrderId }>
      <div className="front" id={ 'front_' + props.cardOrderId } >
        <div id={`front_question_${props.cardOrderId}`} className='question-number'>
          <span className="current-question">{props.currentCardNumber}</span>{`/${props.totalQuestionCards}`}
        </div>
        <div id={"question_" + props.cardOrderId} className='question'>{props.cardData.question}</div>
        <div id={"question_container_" + props.cardOrderId} className='option-container'>
          {
            props.cardData.options.map((d, i) => {
              return <div
                key={i}
                data-option-id={i}
                id={`${props.cardOrderId}_option_${props.cardOrderId}`}
                className="option-div"
                onClick={props.cardEvents.optionClick}>
                  {d.option}
              </div>
            })
          }
        </div>
        <div id={`progress_bar_front_${props.cardOrderId}`} className="progress-bar">
          <div className="progress-indicator" style={{width: (props.questionNumber * 100 / +props.totalQuestionCards) + "%"  }}></div>
        </div>
        <div id="credits" className="credits" >
          <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
        </div>
      </div>
      <div className="back" id={`back_${props.cardOrderId}`} >
        <div id={`back_question_${props.cardOrderId}`} className='question-number'>
          <span className="current-question">{props.currentCardNumber}</span>{`/${props.totalQuestionCards}`}
        </div>
        <div id={`title_${props.cardOrderId}`} className="title">Answer</div>
        <div className="answers-container">
          <div className="wrong-answer">
            <span className="option-text"></span>
            <span className="cross-marker">✕</span>
          </div>
          <div id="correct_answer1" className="correct-answer">
            <span className="option-text">{props.cardData.options.find((e) => { e.right_or_wrong === "right" })}</span>
            <span className="tick-marker">✓</span>
          </div>
        </div>
        <div id={`gif_${props.cardOrderId}`} className="gif-div">
          <img className="gif" />
        </div>
        <div className="clear-both"></div>
        <div id={`answer_${props.cardOrderId}`} className="answer"></div>
        <div id={`fact_${props.cardOrderId}`} className="fact"></div>
        <div id={`progress_bar_back_${props.cardOrderId}`} className="progress-bar">
          <div className="progress-indicator" style={{width: (props.questionNumber * 100 / +props.totalQuestionCards) + "%"  }}></div>
        </div>
        <div id="credits" className="credits" >
          <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
        </div>
      </div>
    </div>
  )
}