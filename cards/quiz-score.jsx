import React from 'react';
import ReactDOM from 'react-dom';

export function render (props, state) {
  let button_size_css = '';
  if (props.cardConfigs.social_share === 'no' && props.cardConfigs.revisit_answers === 'no') {
    button_size_css = 'full-size';
  }else if (props.cardConfigs.social_share === 'no' || props.cardConfigs.revisit_answers === 'no') {
    button_size_css = 'half-size';
  }
  return (
    <div className='content'>
      <div className='front'>
        <div id="result_container" className="result-container">
          <img className="result-img" src="./src/images/cup.png" />
          <div className="result-text">Thank you!</div>
          <div className="result-score">
            {
              props.cardConfigs.timer === 'yes' ?
                `${props.score} / ${props.totalQuestionCards * props.cardConfigs.time_per_question}` :
                `${props.score} / ${+props.totalQuestionCards}`
            }
          </div>
        </div>
        <div id="buttons_container" className="buttons-container">
          {
            props.cardConfigs.revisit_answers === 'yes' ?
              <div id="revisit" className="revisit card-button" onClick={props.cardEvents.revisitAnswers} >
                <img className="card-button-img" src="./src/images/revisit.png" />
                <div className="card-button-text">Revisit Answers</div>
              </div>
            :
             undefined
          }

          <div id="replay" className={`replay card-button ${button_size_css}`}  onClick={props.cardEvents.resetQuiz} >
            <img className="card-button-img" src="./src/images/replay.png" />
            <div className="card-button-text">Play Again</div>
          </div>

          {
            props.cardConfigs.social_share === 'yes' ?
              <div id="share" className="share card-button" onClick={(e) => {e.target.closest('.question-card').classList.add("clicked")}}>
                <img className="card-button-img" src="./src/images/share.png" />
                <div className="card-button-text">Share</div>
              </div>
            :
              undefined
          }
          <div className="clearfix"></div>
        </div>
        <div className="links-container"></div>
        <div id="credits" className="credits" >
          <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
        </div>
      </div>
      <div className='back'>
        <div className="share-card">
          <div className="share-image-div">
            <div className="share-title" style={{color: 'white'}}>
              {
                props.introCardConfigs.quiz_title
              }
            </div>
          </div>
          <div className="share-msg">
            {
              props.cardConfigs.share_msg.replace(/{score}/g, props.score)
            }
          </div>
        </div>
        <div className="share-buttons-div">
          <div
            className="fb-share-button"
            data-href={`${props.cardConfigs.share_link}`}
            data-layout="button"
            data-size="large"
            data-mobile-iframe="true">
            <a
              className="fb-xfbml-parse-ignore"
              target="_blank"
              href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fplugins%2F&amp;src=sdkpreparse">
              Share
            </a>
          </div>
          <a
            className="twitter-share-button"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(props.cardConfigs.share_msg)}&url=${encodeURIComponent(props.cardConfigs.share_link)}`}
            data-size="large">Tweet
          </a>
          <div className="clearfix"></div>
        </div>
        <div className="back-link">Go Back</div>
        <div id="credits" className="credits" >
          <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
        </div>
      </div>
    </div>
  )
}