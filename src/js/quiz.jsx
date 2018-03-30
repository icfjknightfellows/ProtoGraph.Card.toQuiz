import React              from 'react';
import ReactDOM           from 'react-dom';
import axios              from 'axios';
import Utility            from './utility.js';
import Touch              from './touch.js';
import IntroductionCard   from '../cards/quiz-introduction.jsx';
import ResultCard         from '../cards/quiz-conclusion.jsx';
import QuestionCard       from '../cards/question-cards.jsx';

class Quiz extends React.Component {

  constructor(props) {
    super(props)
    let stateVar = {
      fetchingData: true,
      dataJSON: {
        data: {},
        mandatory_config: {}
      },
      languageTexts: {},
      totalQuestions: 0,
      score: 0,
      opnum:0,
      rightCounter: 0,
      sliderValue: 0,
      timerCountValue: 10,
      timePerQuestion: 10,
      questionScore: 1,
      qtop: true,
      timer: undefined,
      revisitingAnswers: false,
      isMobile: this.props.mode === 'mobile' ? true : false,
      creditMessage: "toQuiz",
      currentQuestion: 1,
      creditLink: "https://protograph.pykih.com/cards/to-quiz",
      siteConfigs: this.props.siteConfigs,
      intro: true
    };

    if (this.props.dataJSON) {
      stateVar.fetchingData = false;
      stateVar.dataJSON = this.props.dataJSON;
    }

    if (this.props.totalQuestions) {
      stateVar.totalQuestions = this.props.totalQuestions;
    }

    if (this.props.totalCards) {
      stateVar.totalCards = this.props.totalCards;
    }

    if (this.props.languageTexts) {
      stateVar.languageTexts = this.props.languageTexts;
    }

    if (this.props.timePerQuestion) {
      stateVar.timePerQuestion = this.props.timePerQuestion;
    }

    if (this.props.timerCountValue) {
      stateVar.timerCountValue = this.props.timerCountValue;
    }

    if (this.props.optionalConfigJSON) {
      stateVar.optionalConfigJSON = this.props.optionalConfigJSON;
    }

    this.state = stateVar;
  }

  exportData() {
    return document.getElementById('protograph_toQuiz').getBoundingClientRect();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.optionalConfigJSON) {
      this.setState({
        optionalConfigJSON: nextProps.optionalConfigJSON
      });
    }
  }

  componentDidMount() {
    if (this.state.fetchingData){
      let items_to_fetch = [
        axios.get(this.props.dataURL)
      ];

      if (this.props.siteConfigURL) {
        items_to_fetch.push(axios.get(this.props.siteConfigURL));
      }

      axios.all(items_to_fetch).then(axios.spread((cardData, site_configs) => {
          let stateVar = {
            fetchingData: false,
            dataJSON: {
              data: cardData.data.data,
              mandatory_config: cardData.data.mandatory_config
            },
            optionalConfigJSON: {},
            siteConfigs: site_configs ? site_configs.data : this.state.siteConfigs
          };

          stateVar.dataJSON.mandatory_config.language = stateVar.siteConfigs.primary_language.toLowerCase();
          stateVar.totalQuestions = stateVar.dataJSON.data.questions.length;
          stateVar.totalCards = (stateVar.totalQuestions + 2);
          stateVar.languageTexts = this.getLanguageTexts(stateVar.dataJSON.mandatory_config.language);

          if (stateVar.dataJSON.mandatory_config.time_per_question) {
            stateVar.timePerQuestion = stateVar.dataJSON.mandatory_config.time_per_question;
            stateVar.timerCountValue = stateVar.dataJSON.mandatory_config.time_per_question;
          }

          stateVar.optionalConfigJSON.start_button_color = stateVar.siteConfigs.house_colour;
          stateVar.optionalConfigJSON.start_button_text_color = stateVar.siteConfigs.font_colour;
          this.setState(stateVar);
        }));
    }
  }

  getLanguageTexts(languageConfig) {
    let language = languageConfig ? languageConfig : "english",
      text_obj;

    switch(language.toLowerCase()) {
      case "hindi":
        text_obj = {
          question_title: "प्रश्न ",
          ans_title: "उत्तर",
          next: 'अगला प्रश्न',
          swipe: 'अगले प्रश्न के लिए ऊपर स्वाइप करें या यहां टैप करें',
          revisit_answers: 'उत्तर फिर से देखें',
          social_share: 'शेयर',
          go_back: 'वापस',
          starting_quiz: 'प्रश्नोत्तरी शुरू होता है',
          related_articles: 'संबंधित आलेख',
          timed_out: 'समय समााप्त!',
          correct: 'सही',
          wrong: 'गलत',
          message: 'धन्यवाद!',
          play_again: 'पुनः खेलें',
          oops: 'उफ़!',
          times_up: 'समय समाप्त',
          slider_text: 'प्रश्नों के बीच चलने के लिए स्लाइडर का उपयोग करें',
          fetching_questions: 'सवाल ला रहा है ...',
          font: "'Hindi', sans-serif"
        }
        break;
      default:
        text_obj = {
          question_title: "Question ",
          ans_title: "ANSWER",
          next: 'Next',
          swipe: 'Swipe up for next question or tap here',
          revisit_answers: 'Revisit Answers',
          social_share: 'Share',
          go_back: 'Go Back',
          starting_quiz: 'Starting your quiz in',
          related_articles: 'RELATED ARTICLES',
          timed_out: 'Timed out!',
          correct: 'Correct',
          wrong: 'Wrong',
          message: 'Thank you!',
          play_again: 'Play Again',
          oops: 'Oops!',
          times_up: "Times's up",
          slider_text: 'use slider to move between questions',
          fetching_questions: 'Fetching Questions ...',
          font: undefined
        }
        break;
    }

    if(typeof text_obj === "object") {
      text_obj.next = text_obj.next;
      text_obj.restart = text_obj.restart;
      text_obj.swipe = text_obj.swipe;
    }

    return text_obj;
  }

  formatNumber(n) {
    return n > 9 ? "" + n : "0" + n;
  }

  startCountdown() {
    let countdownValue = document.querySelector(".protograph-toQuiz-intro-card .protograph-toQuiz-countdown-counter"),
      countdownInterval,
      counter = 3;

    countdownInterval = setInterval(function() {
      counter--;
      if(counter > 0) {
        countdownValue.innerHTML = counter;
      } else if(counter === 0) {
        countdownValue.innerHTML = "GO";
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }

  // EVENTS
  startQuiz(e) {
    let button = document.querySelector(".protograph-toQuiz-intro-button"),
      introCard = document.querySelector(".protograph-toQuiz-intro-card"),
      introFront = document.querySelector(".protograph-toQuiz-intro-front"),
      firstQCard = document.querySelector(".protograph-toQuiz-question-card[data-order='0']"),
      totalQuestions = this.state.totalQuestions,
      config = this.state.dataJSON.mandatory_config;

    introFront.style.display = "none";
    document.querySelector(".protograph-toQuiz-intro-back").style.display = "block";

    if(!this.state.isMobile) {
      button.style.visibility = "hidden";
      document.querySelector(".protograph-toQuiz-intro-cover").style.display = "block";
    }
    introCard.classList.add("protograph-toQuiz-clicked");

    this.startCountdown();

    setTimeout(() => {
      introCard.style.top = "-1000px";
      if(!(config.quiz_type === "scoring" && !config.flip_card)) {
        firstQCard.querySelector(".protograph-toQuiz-back").style.display = "none";
      }

      firstQCard.classList.add("protograph-toQuiz-active");
      firstQCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, 160, 0, 1)`;

      for(let i = 1; i < totalQuestions; i++) {
        let card = document.querySelector(`.protograph-toQuiz-question-card[data-order='${i}']`);

        card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${ 160 - (i * 13)}, ${(i * 320 * -1)}, ${(1 + 0.08 * i)})`;
        if(i > 2) {
          card.style.opacity = 0;
        } else {
          card.style.opacity = 1;
        }
      }

      let conclusionCard = document.querySelector(".protograph-toQuiz-conclusion-card");
      conclusionCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${160 - ((totalQuestions) * 13)}, ${(totalQuestions * 320 * -1)}, ${(1 + 0.08 * totalQuestions)})`;
      if(totalQuestions < 3) {
        conclusionCard.style.opacity = 1;
      }

      if(config.quiz_type === "scoring" && config.timer) {
        this.setTimer();
      }
    }, 4000);

    // if (ga) {
    //   ga('pyktracker.send', 'event', {
    //     eventCategory: 'onStart',
    //     eventAction: 'click',
    //     eventLabel: 0,
    //     eventValue: 0
    //     });
    // }
  }

  optionClicked(e) {
    let qCard = document.querySelector(".protograph-toQuiz-question-card.protograph-toQuiz-active"),
      config = this.state.dataJSON.mandatory_config,
      totalQuestions = this.state.totalQuestions,
      cardData = this.state.dataJSON.data.questions[+qCard.getAttribute('data-order')],
      option = cardData.options[+e.target.getAttribute('data-option-id')];

    if(config.quiz_type === "scoring") {
      if(config.timer) {
        this.clearTimer();
        if(!config.flip_card) {
          qCard.querySelector(".protograph-toQuiz-front .protograph-toQuiz-timer").style.display = "none";
        }
      }
      if(option.right_or_wrong) {
        this.setState((prevState, props) => {
          return {
            right_counter: prevState.right_counter + 1,
            score: prevState.score + this.state.questionScore
          };
        });
        this.flashCorrectIndicator();
      } else {
        this.flashWrongIndicator();
      }
    }

    this.addOptionBasedContent(option);
    e.stopPropagation();

    // if (ga) {
    //   ga('pyktracker.send', 'event', {
    //     eventCategory: 'onClickOfOption',
    //     eventAction: 'click',
    //     eventLabel: order_id + 1,
    //     eventValue: option.option
    //   });
    // }
  }

  addOptionBasedContent(option) {
    let qCard = document.querySelector(".protograph-toQuiz-question-card.protograph-toQuiz-active"),
      parent = qCard.querySelector(".protograph-toQuiz-content"),
      orderId = qCard.getAttribute("data-order"),
      config = this.state.dataJSON.mandatory_config;

    option = option || {};

    qCard.setAttribute('data-isNavigable', 1);
    if(!(config.quiz_type === "scoring" && !config.flip_card)) {
      let backDiv = parent.querySelector(".protograph-toQuiz-back");

      if(config.quiz_type === "scoring") {
        setTimeout(function() {
          qCard.classList.add("protograph-toQuiz-clicked");
          if(option.right_or_wrong) {
            backDiv.querySelector(".protograph-toQuiz-wrong-answer").style.display = "none";
            backDiv.querySelector(".protograph-toQuiz-correct-answer").classList.remove("protograph-toQuiz-deselected");
          } else {
            backDiv.querySelector(".protograph-toQuiz-wrong-answer").style.display = "block";
            backDiv.querySelector('.protograph-toQuiz-wrong-answer .protograph-toQuiz-option-text').innerHTML = option.option;
            backDiv.querySelector(".protograph-toQuiz-correct-answer").classList.add("protograph-toQuiz-deselected");
          }
          setTimeout(function() {
            parent.querySelector(".protograph-toQuiz-front").style.display = "none";
            backDiv.style.display = "block";
          }, 100);
        }, 1100);
      } else {
        qCard.classList.add("protograph-toQuiz-clicked");
        setTimeout(function() {
          parent.querySelector(".protograph-toQuiz-front").style.display = "none";
          backDiv.style.display = "block";
        }, 100);
        backDiv.querySelector('.protograph-toQuiz-correct-answer').innerHTML = option.option;
      }

      if(option.gif_image && option.gif_image.image) {
        backDiv.querySelector(".protograph-toQuiz-gif-div").style.display = "block";
        backDiv.querySelector(".protograph-toQuiz-gif").onload = function (e) {
          let imgClientRect = e.target.offsetWidth,
            imgContainerClientRect = backDiv.querySelector(".protograph-toQuiz-gif-div").offsetWidth,
            idealImgWidth = imgContainerClientRect - 20;

          if(imgClientRect >= idealImgWidth) {
            e.target.style.width = idealImgWidth + "px";
          }
        };
        backDiv.querySelector(".protograph-toQuiz-gif").setAttribute("src", option.gif_image.image);
      } else {
        backDiv.querySelector(".protograph-toQuiz-gif-div").style.display = "none";
      }

      if(option.fact) {
        backDiv.querySelector(".protograph-toQuiz-fact").style.display = "block";
        backDiv.querySelector(".protograph-toQuiz-fact").innerHTML = "";
        backDiv.querySelector(".protograph-toQuiz-fact").appendChild(document.createTextNode(option.fact));
      } else {
        backDiv.querySelector(".protograph-toQuiz-fact").style.display = "none";
      }
    } else {
      if(config.quiz_type === "scoring") {
        let allOptions = parent.querySelectorAll(".protograph-toQuiz-option-div"),
          frontDiv = parent.querySelector(".protograph-toQuiz-front");

        for(let j = 0; j < allOptions.length; j++) {
          allOptions[j].style.display = "none";
        }
        frontDiv.querySelector(".protograph-toQuiz-question").style.color = "#a8a8a8";
        frontDiv.querySelector(".protograph-toQuiz-title").style.display = "block";
        frontDiv.querySelector(".protograph-toQuiz-answers-container").style.display = "block";
        if(this.state.isMobile) {
          frontDiv.querySelector(".protograph-toQuiz-swipe-hint-container").style.display = "block";
        } else {
          frontDiv.querySelector(".protograph-toQuiz-next-container").style.display = "block";
        }
        if(option.right_or_wrong) {
          frontDiv.querySelector(".protograph-toQuiz-wrong-answer").style.display = "none";
          frontDiv.querySelector(".protograph-toQuiz-correct-answer").classList.remove("protograph-toQuiz-deselected");
        } else {
          frontDiv.querySelector(".protograph-toQuiz-wrong-answer").style.display = "block";
          frontDiv.querySelector('.protograph-toQuiz-wrong-answer .protograph-toQuiz-option-text').innerHTML = option.option;
          frontDiv.querySelector(".protograph-toQuiz-correct-answer").classList.add("protograph-toQuiz-deselected");
        }
      }
    }
  }

  swipeCallback(direction) {
    if (this.state.revisitAnswers) {
      return;
    }

    let qCard = document.querySelector(".protograph-toQuiz-question-card.protograph-toQuiz-active"),
      orderId = +qCard.getAttribute("data-order"),
      mainContainerWidth = document.querySelector(".protograph-toQuiz-main-container").offsetWidth,
      nextCard = document.querySelector(".protograph-toQuiz-question-card[data-order='" + (orderId + 1) + "']"),
      config = this.state.dataJSON.mandatory_config,
      totalQuestions = this.state.totalQuestions,
      backDiv;

    if (!+qCard.getAttribute('data-isNavigable')) {
      return;
    }

    qCard.classList.remove("protograph-toQuiz-active");
    if(nextCard) {
      nextCard.classList.add("protograph-toQuiz-active");
      if(config.quiz_type === "scoring" && config.timer) {
        this.setState({timerCountValue: this.state.timePerQuestion});
        this.setTimer();
      }
      if(!(config.quiz_type === "scoring" && !config.flip_card)) {
        backDiv = nextCard.querySelector(".protograph-toQuiz-back");
        backDiv.style.display = "none";
      }
    } else {
      document.querySelectorAll(".protograph-toQuiz-progress-bar").forEach((e) => {
        e.style.display = 'none';
      });

      if(!(config.quiz_type === "scoring" && !config.flip_card)) {
        document.querySelectorAll('.protograph-toQuiz-question-card .protograph-toQuiz-back .protograph-toQuiz-swipe-hint-container').forEach((e) => {
          e.style.display = 'none';
        });
        document.querySelectorAll('.protograph-toQuiz-question-card .protograph-toQuiz-back .protograph-toQuiz-next-container').forEach((e) => {
          e.style.display = 'none';
        });
      } else {
        document.querySelectorAll('.protograph-toQuiz-question-card .protograph-toQuiz-front .protograph-toQuiz-swipe-hint-container').forEach((e) => {
          e.style.display = 'none';
        });
        document.querySelectorAll('.protograph-toQuiz-question-card .protograph-toQuiz-front .protograph-toQuiz-next-container').forEach((e) => {
          e.style.display = 'none';
        });
      }
    }

    switch(direction) {
      case "left":
        qCard.style.left = "-1000px";
        break;
      case "right":
        qCard.style.left = (mainContainerWidth + 500) + "px";
        break;
      case "up":
        qCard.style.top = "-1000px";
        break;
    }

    for(let i = (orderId + 1); i < totalQuestions; i++) {
      let card = document.querySelector(`.protograph-toQuiz-question-card[data-order='${i}']`),
        position = (i - orderId - 1);

      card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${ 160 - (position * 13)}, ${(position * 320 * -1)}, ${(1 + 0.08 * position)})`;
      if((i - orderId) < 4) {
        card.style.opacity = 1;
      }
    }

    let conclusionCard = document.querySelector(".protograph-toQuiz-conclusion-card"),
      position = totalQuestions - orderId - 1;
    conclusionCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${160 - (position * 13)}, ${(position * 320 * -1)}, ${(1 + 0.08 * position)})`;
    if((totalQuestions - orderId) < 4) {
      conclusionCard.style.opacity = 1;
    }

    // if (ga) {
    //   ga('pyktracker.send', 'event', {
    //     eventCategory: 'onSwipeLeft',
    //     eventAction: 'swipe',
    //     eventLabel: order_id + 1,
    //     eventValue: order_id + 1
    //   });
    // }
  }

  touchEndHandler(event) {
    Touch.swipeEnd(event,
      ((e) => { console.log("swipeLeft"); }),
      ((e) => { console.log("swipeRight"); }),
      ((e) => { this.swipeCallback("up"); }),
      ((e) => { console.log("swipeRight"); })
    );
  }

  resetQuiz(e) {
    this.setState({
      right_counter: 0,
      score: 0,
      timer: undefined,
      revisitAnswers: false
    });

    let qCard = document.querySelector(".protograph-toQuiz-question-card.protograph-toQuiz-active"),
      allQuestions = document.querySelectorAll(".protograph-toQuiz-question-card"),
      totalQuestions = this.state.totalQuestions,
      config = this.state.dataJSON.mandatory_config,
      i;

    if(qCard) {
      qCard.classList.remove("protograph-toQuiz-active");
    }

    for (i = 0;  i < allQuestions.length; i++) {
      let questionElement = allQuestions[i],
        frontElement = questionElement.querySelector(".protograph-toQuiz-front"),
        allOptions;

      questionElement.classList.remove("protograph-toQuiz-clicked");
      questionElement.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${160 - (i * 13)}, ${(i * 320 * -1)}, ${(1 + 0.08 * i)})`;
      questionElement.style.display = "block";
      frontElement.style.display = "block";
      questionElement.style.top = "0px";
      questionElement.setAttribute('data-isNavigable', 0);
      if(i < 3) {
        questionElement.style.opacity = 1;
      } else {
        questionElement.style.opacity = 0;
      }

      if(config.quiz_type === "scoring" && !config.flip_card) {
        allOptions = frontElement.querySelectorAll(".protograph-toQuiz-option-div");
        for(let j = 0; j < allOptions.length; j++) {
          allOptions[j].style.display = "block";
        }
        frontElement.querySelector(".protograph-toQuiz-question").style.color = "black";
        frontElement.querySelector(".protograph-toQuiz-title").style.display = "none";
        frontElement.querySelector(".protograph-toQuiz-answers-container").style.display = "none";
        if(this.state.isMobile) {
          frontElement.querySelector(".protograph-toQuiz-swipe-hint-container").style.display = "none";
        } else {
          frontElement.querySelector(".protograph-toQuiz-next-container").style.display = "none";
        }
        if(config.timer) {
          frontElement.querySelector(".protograph-toQuiz-timer").style.display = "block";
          frontElement.querySelector(".protograph-toQuiz-timeout-msg").style.display = "none";
        }
      } else {
        questionElement.querySelector('.protograph-toQuiz-back').style.display = 'none';
        if(this.state.isMobile) {
          let swipeHint = questionElement.querySelector(".protograph-toQuiz-back .protograph-toQuiz-swipe-hint-container");
          swipeHint.style.display = "block";
        } else {
          let backNext = questionElement.querySelector(".protograph-toQuiz-back .protograph-toQuiz-next-container");
          backNext.style.display = "block";
        }
        if(config.quiz_type === "scoring" && config.timer) {
          questionElement.querySelector(".protograph-toQuiz-timeout-msg").style.display = "none";
        }
      }
    }

    document.querySelector(".protograph-toQuiz-question-card[data-order='0']").classList.add('protograph-toQuiz-active');


    let conclusionCard = document.querySelector(".protograph-toQuiz-conclusion-card"),
      progressBars = document.querySelectorAll(".protograph-toQuiz-progress-bar");

    conclusionCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${160 - (totalQuestions * 13)}, ${(totalQuestions * 320 * -1)}, ${(1 + 0.08 * totalQuestions)})`;
    if(totalQuestions < 3) {
      conclusionCard.style.opacity = 1;
    } else {
      conclusionCard.style.opacity = 0;
    }

    progressBars.forEach((e) => {
      e.style.display = 'block';
    });

    this.hideSlider();

    if(config.quiz_type === "scoring" && config.timer) {
      this.setState({timerCountValue: this.state.timePerQuestion});
      this.setTimer();
    }

    // if (ga) {
    //   ga('pyktracker.send', 'event', {
    //     eventCategory: 'onReset',
    //     eventAction: 'click',
    //     eventLabel: total_questions,
    //     eventValue: total_questions
    //   });
    // }
  }

  revisitAnswers(e) {
    this.showSlider();
    this.slideCallback(0);
    this.setState({revisitAnswers: true});

    //Question-Card
    document.querySelectorAll('.protograph-toQuiz-question-card').forEach((e) => {
      e.setAttribute('data-isNavigable', 0);
    });
  }

  slideCallback(value) {
    this.setState({sliderValue: value});
    let slider = document.querySelector(".protograph-toQuiz-card-slider"),
      sliderWidth = parseFloat(slider.style.width),
      sliderHint = document.querySelector(".protograph-toQuiz-slider-hint"),
      cardNum = document.querySelector(".protograph-toQuiz-slider-card-no"),
      totalQuestions = this.state.totalQuestions,
      percent = value / totalQuestions * 100,
      conclusionCard = document.querySelector(".protograph-toQuiz-conclusion-card");

    slider.style.background = "linear-gradient(to right, #D6EDFF 0%, #168BE5 " + percent + "%, #EEE " + percent + "%)";

    if(isNaN(sliderWidth)) {
      sliderWidth = 270;
    }
    cardNum.innerHTML = (+value + 1) > totalQuestions ? "" : (+value + 1);
    cardNum.style.left = (value / totalQuestions * (sliderWidth - 16) + 4) + "px";

    for(let i = 0; i < totalQuestions; i++) {
      let qCard = document.querySelector(`.protograph-toQuiz-question-card[data-order='${i}']`);
      if(i < value) {
        qCard.style.top = "-1000px";
      } else {
        let position = i - value;
        qCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${ 160  - (position * 13)}, ${(i * 320 * -1)}, ${(1 + 0.08 * position)})`;
        qCard.style.display = "block";
        // q_card.style.left = "50%";
        qCard.style.top = "0px";
        if((i - value) < 3) {
          setTimeout(function() {
            qCard.style.opacity = 1;
          }, 300);
        } else {
          setTimeout(function() {
            qCard.style.opacity = 0;
          }, 300);
        }
      }
    }

    conclusionCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${160 - ((totalQuestions - value) * 13)}, ${(totalQuestions * 320 * -1)}, ${(1 + 0.08 * (totalQuestions - value))})`;
    if((totalQuestions - value) < 3) {
      setTimeout(function() {
        conclusionCard.style.opacity = 1;
      }, 300);
    } else {
      setTimeout(function() {
        conclusionCard.style.opacity = 0;
      }, 300);
    }
  }

  socialShare(e) {
    const conclusionCard = document.querySelector('.protograph-toQuiz-conclusion-card'),
      conclusionFront = document.querySelector('.protograph-toQuiz-conclusion-front'),
      conclusionBack = document.querySelector('.protograph-toQuiz-conclusion-back');

    this.setState({revisitAnswers: false});

    if(this.state.revisitAnswers) {
      this.hideSlider();
    }
    conclusionCard.classList.add("protograph-toQuiz-clicked");
    setTimeout(function() {
      conclusionFront.style.display = "none";
    }, 300);
    conclusionBack.style.display = "block";
  }

  setTimer() {
    if(this.state.timer) {
      this.clearTimer();
    }

    let counter = this.state.timePerQuestion,
      activeQuestion = document.querySelector('.protograph-toQuiz-question-card.protograph-toQuiz-active'),
      orderId = +activeQuestion.getAttribute('data-order'),
      options = this.state.dataJSON.data.questions[orderId].options,
      questionScore = counter;

    this.setState({ questionScore: counter });
    const timeInterval = setInterval(() => {
      counter--;

      this.setState({
        timerCountValue: counter,
        questionScore: counter
      });

      if(counter === 0) {
        this.clearTimer();
        this.flashTimeUpIndicator();
        if(!this.state.dataJSON.mandatory_config.flip_card) {
          document.querySelector(".protograph-toQuiz-question-card.protograph-toQuiz-active .protograph-toQuiz-front .protograph-toQuiz-timer").style.display = "none";
        }
        document.querySelector(".protograph-toQuiz-question-card.protograph-toQuiz-active .protograph-toQuiz-timeout-msg").style.display = "block";
        this.addOptionBasedContent(options.filter((e) => { return e.right_or_wrong === true; })[0]);
      }
    }, 1000);

    this.setState({
      timer: timeInterval
    });
  }

  clearTimer() {
    clearInterval(this.state.timer);
    this.setState({
      timer: undefined
    });
  }

  calculateTime(seconds) {
    let out = {
        sec: 30,
        min: 0
      };
    if(typeof seconds === "number") {
      out.sec = this.formatNumber(seconds % 60);
      out.min = this.formatNumber((Math.floor(seconds / 60)) % 60);
    }
    return out;
  }

  sliderMousedownCallback(e) {
    e.stopPropagation();
    document.querySelector(".protograph-toQuiz-slider-hint").style.visibility = "hidden";
    document.querySelector(".protograph-toQuiz-slider-card-no").style.display = "block";
  }

  resetSlider(total_questions) {
    let slider = document.querySelector(".protograph-toQuiz-card-slider");
    slider.setAttribute("value", total_questions);
    slider.style.background = "linear-gradient(to right, #D6EDFF 0%, #168BE5 100%, #EEE 100%)";
  }

  showSlider() {
    document.querySelector(".protograph-toQuiz-card-slider").style.display = "block";
    document.querySelector(".protograph-toQuiz-slider-container").style.display = "block";
  }

  hideSlider() {
    document.querySelector(".protograph-toQuiz-card-slider").style.display = "none";
    document.querySelector(".protograph-toQuiz-slider-container").style.display = "none";
  }

  flashCorrectIndicator() {
    document.querySelector("#correct_indicator").style.display = "block";
    setTimeout(function() {
      document.querySelector("#correct_indicator").style.display = "none";
    }, 1000);
  }

  flashWrongIndicator() {
    document.querySelector("#wrong_indicator").style.display = "block";
    setTimeout(function() {
      document.querySelector("#wrong_indicator").style.display = "none";
    }, 1000);
  }

  flashTimeUpIndicator() {
    document.querySelector("#time_out_indicator").style.display = "block";
    setTimeout(function() {
      document.querySelector("#time_out_indicator").style.display = "none";
    }, 1000);
  }

  renderCorrectIndicator() {
    return (
      <div id="correct_indicator" className="protograph-toQuiz-correct-wrong-indicator protograph-toQuiz-correct-background">
        <h1 className="ui header protograph-toQuiz-tick-background">
          <span className="protograph-toQuiz-correct-tick">&#10004;&#xFE0E;</span>
        </h1>
        <div className="protograph-toQuiz-correct-wrong-text">{this.state.languageTexts.correct}</div>
      </div>
    );
  }

  renderWrongIndicator() {
    return (
      <div id="wrong_indicator" className="protograph-toQuiz-correct-wrong-indicator protograph-toQuiz-wrong-background">
        <h1 className="ui header protograph-toQuiz-tick-background protograph-toQuiz-wrong-tick">
          <span>&#10007;&#xFE0E;</span>
        </h1>
        <div className="protograph-toQuiz-correct-wrong-text protograph-toQuiz-wrong">{this.state.languageTexts.wrong}</div>
      </div>
    );
  }

  renderTimeOutIndicator () {
    return (
      <div id="time_out_indicator" className="protograph-toQuiz-time-out-indicator">
        <div className="protograph-toQuiz-time-out-content">
          <div className="protograph-toQuiz-clock-icon">
            <img src={`${this.props.baseURL}/images/clock-large.png`} />
          </div>
          <div className="protograph-toQuiz-time-value">00:00</div>
          <div className="protograph-toQuiz-oops-msg">{this.state.languageTexts.oops}</div>
          <div className="protograph-toQuiz-times-up-msg">{this.state.languageTexts.times_up}</div>
        </div>
      </div>
    );
  }

  renderQuiz() {
    if (this.state.fetchingData) {
      return (
        <div className={`protograph-toQuiz-quiz-container ${this.state.isMobile ? 'protograph-toQuiz-mobile-quiz-container' : ''}`} style={{"fontFamily": "'Helvetica Neue', sans-serif, aerial"}}>
          <div className="protograph-toQuiz-loading-card" style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', opacity:1, zIndex: 500}}>
            <span className="protograph-toQuiz-loading-text" style={{position:'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
              Fetching Questions ...
            </span>
          </div>
        </div>
      )
    } else {

      let styles = {},
        x = 147, //(this.state.totalQuestions * 20) - 20,
        y = 0 - 320,
        z = 1 + 0.08,
        questionsData = this.state.dataJSON.data.questions ? this.state.dataJSON.data.questions : [],
        qCards;

      qCards = questionsData.map((card, i) => {
        const style = {},
          events = {};

        style.zIndex = this.state.totalQuestions - i;
        style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${x}, ${y}, ${z})`;

        if(i < 2) {
          style.opacity = 1;
        } else {
          style.opacity = 0;
        }

        x = x - 13;
        y = y - 320;
        z = z + 0.08;

        events.optionClick = ((e) => this.optionClicked(e));
        if (this.state.isMobile) {
          events.onTouchStart = ((e) => Touch.swipeStart(e));
          events.onTouchMove = ((e) => Touch.swipeMove(e));
          events.onTouchEnd = ((e) => this.touchEndHandler(e));
          events.nextCard = ((e) => {this.swipeCallback('up'); e.stopPropagation();});
        } else {
          events.nextCard = ((e) => this.swipeCallback('up'));
        }

        return (
          <QuestionCard
            key={i}
            cardNo={i}
            questionNo={this.formatNumber(i + 1)}
            cardStyle={style}
            cardData={this.state.dataJSON.data.questions[i]}
            cardEvents={events}
            cardConfigs={this.state.dataJSON.mandatory_config}
            languageTexts={this.state.languageTexts}
            totalQuestions={this.formatNumber(this.state.totalQuestions)}
            isMobile={this.state.isMobile}
            timerValue={this.calculateTime(this.state.timerCountValue)}
            baseURL={this.props.baseURL}
            creditLink={this.state.creditLink}
            creditMessage={this.state.creditMessage}
          />
        )
      });

      return this.renderMainContainerContent(qCards)
    }
  }
  handleOptionClick(e){
    if(e.target.getAttribute('data-correct') === "true"){
      this.flashCorrectIndicator()
    }else{
      this.flashWrongIndicator()
    }
    let target = e.target;
    setTimeout(()=>{
      this.setState({
        qtop:false,
        opnum: target.getAttribute('data-opnum')
      })
    }, 1000)
  }

  handleNextClick(e){
    this.setState({
      currentQuestion: this.state.currentQuestion+1,
      qtop: true,
      opnum: 0
    })
  }
  renderAnswerCard(i, answer){
    return(
      <div className="answer-card" key={`answer-${i+1}`} id={`answer-${i+1}`} style={{left:300*(i-this.state.currentQuestion+1)}}>
        <div className="quiz-answer">
          {answer.option}
        </div>
        {answer.gif_image && <div className="quiz-answer-image">
          <img style={{height:"100%",width:"100%"}} src={answer.gif_image.image} />
        </div>}
        <p>
          {answer.fact}
        </p>
      </div>
    )
  }
  renderQuestionCard(q,i){
    return(
      <div className="question-card" style={{left:300*(i-this.state.currentQuestion+1)}} key={i}>
        <div className="quiz-question">
          {q.question}
        </div>
        <div className="quiz-answer-options">
          {
            q.options.map((a,j)=>{
              return(
                <div className="single-option" data-opnum={j} data-correct={a.right_or_wrong} onClick={(e)=>{this.handleOptionClick(e)}} key={`${i}-${j}`}>
                  {a.option}
                </div>
              )
            })
          }
        </div>
      </div>
    )
  }
  renderIntro(){
    return(
      <div className="first-view view">
        <div className="proto-col-3 view-in-desktop">
          <div className="tag-area"></div>
          <div className="cover-content">
            <div className="title">{this.state.dataJSON.data.basic_datapoints.quiz_title}</div>
            <div className="description">{this.state.dataJSON.data.basic_datapoints.introduction}</div>
            <div className="call-to-action-button" onClick={()=>{document.getElementsByClassName('toquizcard')[0].classList.add('flipped');this.setState({intro:false})}}>{this.state.dataJSON.data.basic_datapoints.start_button_text}</div>
          </div>
        </div>
        <div className="proto-col-4">
          <div className="cover-image">
            <img src={this.state.dataJSON.data.basic_datapoints.background_image.image} style={{height:"100%", width:"100%"}}/>
          </div>
        </div>
      </div>
    )
  }
  renderQuestions(){
    let percent = this.state.currentQuestion / this.state.totalQuestions;
    percent = percent * 100 + "%";
    return(
      <div className="second-view view">
        <div className="proto-col-3 view-in-desktop" style={{opacity:'0.3'}}>
          <div className="tag-area"></div>
          <div className="cover-content">
            <div className="title">{this.state.dataJSON.data.basic_datapoints.quiz_title}</div>
            <div className="description">{this.state.dataJSON.data.basic_datapoints.introduction}</div>
          </div>
        </div>
        <div className="proto-col-4">
          <div className="progress-line">
            <div className="progress-start-lable">{this.state.currentQuestion}</div>
            <div className="progress-container">
              <div className="progress-after" style={{height: percent}}></div>
              <div className="progress"></div>
            </div>
          </div>
          <div className="main-content">
            <div className="card-tabs">
              <div className={`single-tab ${this.state.qtop ? 'active' : 'inactive'}`}>QUESTION</div>
              <div className={`single-tab ${!this.state.qtop ? 'active' : 'inactive'}`}>ANSWER</div>
            </div>
            {
              this.state.qtop && !this.state.intro ? 
              <div className="quiz-cards">
                {
                  this.state.dataJSON.data.questions.map((q,i)=>{
                    if(i >= this.state.currentQuestion - 2 && i <= this.state.currentQuestion){
                      return(
                        this.renderQuestionCard(q,i)
                      )
                    }else{
                      return null
                    }
                  }) 
                }
              </div>
              :
              <div className="quiz-cards">
                {
                  this.state.dataJSON.data.questions.map((q,i)=>{
                    if(i >= this.state.currentQuestion - 2 && i <= this.state.currentQuestion){
                      let answer;
                      if(i === this.state.currentQuestion - 1){
                        answer = q.options[this.state.opnum];
                      }else{
                        answer =  q.options[0];
                      }
                      return(
                        this.renderAnswerCard(i, answer)
                      );
                    }else{
                      return null;
                    }
                  })
                }
              </div>
            }
            {!this.state.qtop && <div className="next-button" onClick={(e)=>{
              this.handleNextClick(e)
            }}>NEXT</div>}
          </div>
          {this.renderWrongIndicator()}
          {this.renderCorrectIndicator()}
        </div>
      </div>
    )
  }
  renderLaptop(){

    if (this.state.fetchingData) {
      return (
        <div className={`protograph-toQuiz-quiz-container ${this.state.isMobile ? 'protograph-toQuiz-mobile-quiz-container' : ''}`} style={{"fontFamily": "'Helvetica Neue', sans-serif, aerial"}}>
          <div className="protograph-toQuiz-loading-card" style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', opacity:1, zIndex: 500}}>
            <span className="protograph-toQuiz-loading-text" style={{position:'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
              Fetching Questions ...
            </span>
          </div>
        </div>
      )
    } else {
      return(
        <div className="toquizcard parent-card-desktop">
          {this.renderIntro()}
          {this.renderQuestions()}
        </div>
      )
    }
  }
  renderMobile() {
    if (this.state.fetchingData) {
      return (
        <div className='protograph-toQuiz-quiz-container protograph-toQuiz-mobile-quiz-container' style={{"fontFamily": "'Helvetica Neue', sans-serif, aerial"}}>
          <div className="protograph-toQuiz-loading-card" style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', opacity:1, zIndex: 500}}>
            <span className="protograph-toQuiz-loading-text" style={{position:'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
              Fetching Questions ...
            </span>
          </div>
        </div>
      )
    } else {

      let styles = {},
        x = 147, //(this.state.totalQuestions * 20) - 20,
        y = 0 - 320,
        z = 1 + 0.08,
        questionsData = this.state.dataJSON.data.questions ? this.state.dataJSON.data.questions : [],
        qCards;

      qCards = questionsData.map((card, i) => {
        const style = {},
          events = {};

        style.zIndex = this.state.totalQuestions - i;
        style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${x}, ${y}, ${z})`;

        if(i < 2) {
          style.opacity = 1;
        } else {
          style.opacity = 0;
        }

        x = x - 13;
        y = y - 320;
        z = z + 0.08;

        events.optionClick = ((e) => this.optionClicked(e));
        if (this.state.isMobile) {
          events.onTouchStart = ((e) => Touch.swipeStart(e));
          events.onTouchMove = ((e) => Touch.swipeMove(e));
          events.onTouchEnd = ((e) => this.touchEndHandler(e));
          events.nextCard = ((e) => {this.swipeCallback('up'); e.stopPropagation();});
        } else {
          events.nextCard = ((e) => this.swipeCallback('up'));
        }

        return (
          <QuestionCard
            key={i}
            cardNo={i}
            questionNo={this.formatNumber(i + 1)}
            cardStyle={style}
            cardData={this.state.dataJSON.data.questions[i]}
            cardEvents={events}
            cardConfigs={this.state.dataJSON.mandatory_config}
            languageTexts={this.state.languageTexts}
            totalQuestions={this.formatNumber(this.state.totalQuestions)}
            isMobile={this.state.isMobile}
            timerValue={this.calculateTime(this.state.timerCountValue)}
            baseURL={this.props.baseURL}
            creditLink={this.state.creditLink}
            creditMessage={this.state.creditMessage}
          />
        )
      });

      return this.renderMainContainerContent(qCards)
    }
  }
  renderScreenshot() {
    if (this.state.fetchingData) {
      return (
        <div className={`protograph-toQuiz-quiz-container ${this.state.isMobile ? 'protograph-toQuiz-mobile-quiz-container' : ''}`} style={{"fontFamily": "'Helvetica Neue', sans-serif, aerial"}}>
          <div className="protograph-toQuiz-loading-card" style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', opacity:1, zIndex: 500}}>
            <span className="protograph-toQuiz-loading-text" style={{position:'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
              Fetching Questions ...
            </span>
          </div>
        </div>
      )
    } else {
      const data = this.state.dataJSON.data,
      introCardConfigs = {
        background_image: data.basic_datapoints.background_image.image,
        quiz_title: data.basic_datapoints.quiz_title,
        introduction: data.basic_datapoints.introduction,
        start_button_text: data.basic_datapoints.start_button_text,
        start_button_color: this.state.optionalConfigJSON.start_button_color,
        start_button_text_color: this.state.optionalConfigJSON.start_button_text_color
      };
      return (
        <div id="ProtoScreenshot" style={{"fontFamily": this.state.languageTexts.font}}>
          <div style={{padding:10}}>
            <h1 style={{paddingTop:15, paddingLeft: 15}}>{introCardConfigs.quiz_title}</h1>
            <p style={{paddingLeft: 15}}>{introCardConfigs.introduction}</p>
            <button className="protograph-toQuiz-intro-button" style={{marginLeft: 15}}>
              <h3 className="ui header" style={{color: 'white'}}>{introCardConfigs.start_button_text}</h3>
            </button>
          </div>
        </div>
      )
    }
  }

  render() {
    switch(this.props.mode) {
      case 'laptop':
        return this.renderLaptop();
        break;
      case 'mobile':
        return this.renderMobile();
        break;
      case 'tablet':
        return this.renderQuiz();
        break;
      case 'screenshot':
        return this.renderScreenshot();
        break;
    }
  }

}

export default Quiz;