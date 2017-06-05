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
      </div>
      <div className="back" id={ 'back_' + props.cardOrderId } >
        <div id={`back_question_${props.cardOrderId}`} className='question-number'>
          <span className="current-question">{props.currentCardNumber}</span>{`/${props.totalQuestionCards}`}
        </div>
        <div id={`title_${props.cardOrderId}`} className="title">Answer</div>
        <div id={`correct_answer${props.cardOrderId}`} className="correct-answer"></div>
        <div id={`gif_${props.cardOrderId}`} className="gif-div">
          <img className="gif" />
        </div>
        <div className="clear-both"></div>
        <div id={`answer_${props.cardOrderId}`} className="answer"></div>
        <div id={`fact_${props.cardOrderId}`} className="fact"></div>
      </div>
    </div>
  )
}