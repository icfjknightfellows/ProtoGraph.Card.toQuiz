import React from 'react';
import ReactDOM from 'react-dom';

export default class ResultCard extends React.Component {

  componentDidMount() {
    setTimeout(function() {
      //twitter
      window.twttr = (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0],
          t = window.twttr || {};
        if (d.getElementById(id)) return t;
        js = d.createElement(s);
        js.id = id;
        js.src = "https://platform.twitter.com/widgets.js";
        fjs.parentNode.insertBefore(js, fjs);

        t._e = [];
        t.ready = function(f) {
          t._e.push(f);
        };

        return t;
      }(document, "script", "twitter-wjs"));
      //fb
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8";
        fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }, 500);
  }

  goBack(e) {
    const conclusionCard = document.querySelector('.protograph-toQuiz-conclusion-card'),
      conclusionFront = document.querySelector('.protograph-toQuiz-conclusion-front'),
      conclusionBack = document.querySelector('.protograph-toQuiz-conclusion-back');
    conclusionFront.style.display = 'block';
    setTimeout((e) => {
      conclusionBack.style.display = 'none';
    }, 100);
    conclusionCard.classList.remove('protograph-toQuiz-clicked');
  }

  renderReadingLinks() {
    const resultCardConfigs = this.props.resultCardConfigs,
      isScoreSpecific = resultCardConfigs[0].upper_limit_of_score_range,
      config = this.props.cardConfigs;

    let links,
      message = 'Thank you!';

    if(config.quiz_type === "scoring" && isScoreSpecific) {
      const scoreItem = resultCardConfigs.filter((e) => {
        return this.props.score <= e.upper_limit_of_score_range;
      })[0];

      if (scoreItem) {
        message =  scoreItem.message;

        const relatedLinks = scoreItem.related_articles.length > 2 ? scoreItem.related_articles.slice(0, 2) : scoreItem.related_articles;

        links = relatedLinks.map(function(d, i) {
          return (
            <div key={i} className='protograph-toQuiz-single-link-container' >
              <a className='protograph-toQuiz-single-link' href={`${d.related_article_links}`} target='blank'>
                {
                  d.related_article_links ?
                    <img src={`${d.link_image.image}`} className='protograph-toQuiz-link-img' />
                  :
                    undefined
                }
                <div className={`protograph-toQuiz-link-info ${!d.related_article_links ? 'protograph-toQuiz-link-info-full-width' : ''}`} >
                  <div className="protograph-toQuiz-link-title">{d.link_description}</div>
                </div>
              </a>
              <div className='protograph-toQuiz-clearfix'></div>
            </div>
          )
        });
      }
    } else {
      resultCardConfigs.map((e) => {
        const relatedLinks = e.related_articles.length > 2 ? e.related_articles.slice(0, 2) : e.related_articles;
        links = relatedLinks.map(function(d, i) {
          return (
            <div key={i} className='protograph-toQuiz-single-link-container' >
              <a className='protograph-toQuiz-single-link' href={`${d.related_article_links}`} target='blank'>
                {
                  d.related_article_links ?
                    <img src={`${d.link_image.image}`} className='protograph-toQuiz-link-img' />
                  :
                    undefined
                }
                <div className={`protograph-toQuiz-link-info ${!d.related_article_links ? 'protograph-toQuiz-link-info-full-width' : ''}`} >
                  <div className="protograph-toQuiz-link-title">{d.link_description}</div>
                </div>
              </a>
              <div className='protograph-toQuiz-clearfix'></div>
            </div>
          )
        });
      });
    }
    return {links: links, message: message};
  }

  render() {
    const conclusionCardStyle = {};
    let replayStyleCss = '',
      revisitStyleCss = '',
      shareStyleCss = '',
      {links, message} = this.renderReadingLinks();

    conclusionCardStyle.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${ 160 - ((+this.props.totalQuestions + 1) * 20) }, ${((+this.props.totalQuestions + 1) * 320 * -1)}, ${(1 + 0.08 * (+this.props.totalQuestions + 1))})`;
    if(+this.props.totalQuestions > 1) {
      conclusionCardStyle.opacity = 0;
    }

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
      <div className="protograph-toQuiz-conclusion-card" style={conclusionCardStyle}>
        <div className='protograph-toQuiz-content'>
          <div className='protograph-toQuiz-conclusion-front'>
            <div id="result_container" className="protograph-toQuiz-result-container">
              <img className="protograph-toQuiz-result-img" src={`${this.props.baseURL}/images/cup.png`} />
              <div className="protograph-toQuiz-result-text">{message}</div>
              {
                this.props.cardConfigs.quiz_type === 'scoring' &&
                <div className="protograph-toQuiz-result-score">
                  {
                    this.props.cardConfigs.timer ?
                      `${this.props.score} / ${this.props.totalQuestions * this.props.cardConfigs.time_per_question}` :
                      `${this.props.score} / ${+this.props.totalQuestions}`
                  }
                </div>
              }
            </div>
            <div id="buttons_container" className="protograph-toQuiz-buttons-container">
              {
                this.props.cardConfigs.revisit_answers ?
                  <div id="revisit" className={`protograph-toQuiz-revisit protograph-toQuiz-card-button ${revisitStyleCss}`} onClick={this.props.cardEvents.revisitAnswers} >
                    <img className="protograph-toQuiz-card-button-img" src={`${this.props.baseURL}/images/revisit-icon.png`} />
                    <div className="protograph-toQuiz-card-button-text">Revisit Answers</div>
                  </div>
                :
                  undefined
              }

              <div id="replay" className={`protograph-toQuiz-replay protograph-toQuiz-card-button ${replayStyleCss}`}  onClick={this.props.cardEvents.resetQuiz} >
                <img className="protograph-toQuiz-card-button-img" src={`${this.props.baseURL}/images/replay.png`} />
                <div className="protograph-toQuiz-card-button-text">Play Again</div>
              </div>

              {
                this.props.cardConfigs.social_share ?
                  <div id="share" className={`protograph-toQuiz-share protograph-toQuiz-card-button ${shareStyleCss}`} onClick={this.props.cardEvents.socialShare}>
                    <img className="protograph-toQuiz-card-button-img" src={`${this.props.baseURL}/images/share.png`} />
                    <div className="protograph-toQuiz-card-button-text">Share</div>
                  </div>
                :
                  undefined
              }
              <div className="protograph-toQuiz-clearfix"></div>
            </div>
            <div className="protograph-toQuiz-links-container">
              <div className="protograph-toQuiz-related-links-title">RELATED ARTICLES</div>
              <div className="protograph-toQuiz-related-links-content">
                { links }
              </div>
            </div>
            <div id="credits" className="protograph-toQuiz-credits" >
              <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
            </div>
          </div>
          <div className='protograph-toQuiz-conclusion-back'>
            <div className="protograph-toQuiz-share-card">
              <div className="protograph-toQuiz-share-image-div" style={{backgroundImage: `url('${this.props.introCardConfigs.background_image}')`}}>
                <div className="protograph-toQuiz-share-title" style={{color: 'white'}}>
                  {
                    this.props.introCardConfigs.quiz_title
                  }
                </div>
              </div>
              <div className="protograph-toQuiz-share-msg">
                {
                  this.props.cardConfigs.share_msg.replace(/{score}/g, this.props.score)
                }
              </div>
            </div>
            <div className="protograph-toQuiz-share-buttons-div">
              <div className='protograph-toQuiz-fb-div'>
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
              </div>
              <div className='protograph-toQuiz-twitter-div'>
                <a
                  className="twitter-share-button"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(this.props.cardConfigs.share_msg)}&url=${encodeURIComponent(this.props.cardConfigs.share_link)}`}
                  data-size="large">Tweet
                </a>
              </div>
              <div className="protograph-toQuiz-clearfix"></div>
            </div>
            <div className="protograph-toQuiz-back-link" onClick={(e) => this.goBack(e)}>Go Back</div>
            <div id="credits" className="protograph-toQuiz-credits" >
              <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ | Pykih</a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}