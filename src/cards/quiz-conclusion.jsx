import React from 'react';
import ReactDOM from 'react-dom';

export default class ResultCard extends React.Component {
  render() {

    const conclusionCardStyle = {};
    let replayStyleCss = '',
      revisitStyleCss = '',
      shareStyleCss = '';

    conclusionCardStyle.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, 0, ${((+this.props.totalQuestions + 1) * 320 * -1)}, ${(1 + 0.08 * (+this.props.totalQuestions + 1))})`;
    if(+this.props.totalQuestions > 1) {
      conclusionCardStyle.opacity = 0;
    }
    console.log(this.props.cardConfigs.social_share, this.props.cardConfigs.revisit_answers);

    if(!this.props.cardConfigs.social_share) {
      revisitStyleCss = 'half-size';
    }

    if(this.props.cardConfigs.revisit_answers === false && this.props.cardConfigs.social_share === false) {
      replayStyleCss = 'full-size';
    } else if(this.props.cardConfigs.revisit_answers === false || this.props.cardConfigs.social_share === false) {
      replayStyleCss = 'half-size';
    }

    if(!this.props.cardConfigs.revisit_answers) {
      shareStyleCss = 'half-size';
    }

    return (
      <div className="conclusion-card" style={conclusionCardStyle}>
        <div className='content'>
          <div className='front'>
            <div id="result_container" className="result-container">
              <img className="result-img" src="./src/images/cup.png" />
              <div className="result-text">Thank you!</div>
              <div className="result-score">
                {
                  this.props.cardConfigs.timer ?
                    `${this.props.score} / ${this.props.totalQuestions * this.props.cardConfigs.time_per_question}` :
                    `${this.props.score} / ${+this.props.totalQuestions}`
                }
              </div>
            </div>
            <div id="buttons_container" className="buttons-container">
              {
                this.props.cardConfigs.revisit_answers ?
                  <div id="revisit" className={`revisit card-button ${revisitStyleCss}`} onClick={((e) => this.revisitAnswers(e))} >
                    <img className="card-button-img" src="./src/images/revisit.png" />
                    <div className="card-button-text">Revisit Answers</div>
                  </div>
                :
                  undefined
              }

              <div id="replay" className={`replay card-button ${replayStyleCss}`}  onClick={((e) => this.resetQuiz(e))} >
                <img className="card-button-img" src="./src/images/replay.png" />
                <div className="card-button-text">Play Again</div>
              </div>

              {
                this.props.cardConfigs.social_share ?
                  <div id="share" className={`share card-button ${shareStyleCss}`} onClick={(e) => {e.target.closest('.question-card').classList.add("clicked")}}>
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
                    this.props.introCardConfigs.quiz_title
                  }
                </div>
              </div>
              <div className="share-msg">
                {
                  this.props.cardConfigs.share_msg.replace(/{score}/g, this.props.score)
                }
              </div>
            </div>
            <div className="share-buttons-div">
              <div
                className="fb-share-button"
                data-href={`${this.props.cardConfigs.share_link}`}
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
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(this.props.cardConfigs.share_msg)}&url=${encodeURIComponent(this.props.cardConfigs.share_link)}`}
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
      </div>
    )

  }
}