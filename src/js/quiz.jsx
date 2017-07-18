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
      schemaJSON: {},
      optionalConfigJSON: {},
      optionalConfigSchemaJSON: {},
      languageTexts: {},
      totalQuestions: 0,
      score: 0,
      rightCounter: 0,
      sliderValue: 0,
      timerCountValue: 10,
      timePerQuestion: 10,
      questionScore: 1,
      timer: undefined,
      revisitingAnswers: false,
      isMobile: this.props.mode === 'mobile' ? true : false
    };


    if (this.props.dataJSON) {
      stateVar.fetchingData = false;
      stateVar.dataJSON = this.props.dataJSON;
    }

    if (this.props.schemaJSON) {
      stateVar.schemaJSON = this.props.schemaJSON;
    }

    if (this.props.optionalConfigJSON) {
      stateVar.optionalConfigJSON = this.props.optionalConfigJSON;
    }

    if (this.props.optionalConfigSchemaJSON) {
      stateVar.optionalConfigSchemaJSON = this.props.optionalConfigSchemaJSON;
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

    this.state = stateVar;
  }

  exportData() {
    return document.getElementById('protograph_toQuiz').getBoundingClientRect();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      optionalConfigJSON: nextProps.optionalConfigJSON
    })
  }

  componentDidMount() {
    if (this.state.fetchingData){
      axios.all([
        axios.get(this.props.dataURL),
        axios.get(this.props.schemaURL),
        axios.get(this.props.configURL),
        axios.get(this.props.configSchemaURL)
      ]).then(axios.spread((cardData, cardSchema, optionalConfig, optionalConfigSchema) => {
          let stateVar = {
            fetchingData: false,
            dataJSON: {
              data: cardData.data.data,
              mandatory_config: cardData.data.mandatory_config
            },
            schemaJSON: cardSchema.data,
            optionalConfigJSON: optionalConfig.data,
            optionalConfigSchemaJSON: optionalConfigSchema.data
          };

          stateVar.dataJSON.data.result_card_data = stateVar.dataJSON.data.result_card_data ?  this.processResultData(stateVar.dataJSON.data.result_card_data, stateVar.dataJSON.mandatory_config.quiz_type) : undefined;
          stateVar.totalQuestions = stateVar.dataJSON.data.questions.length;
          stateVar.totalCards = (stateVar.totalQuestions + 2);
          stateVar.languageTexts = this.getLanguageTexts(stateVar.dataJSON.mandatory_config.language);

          if (stateVar.dataJSON.mandatory_config.time_per_question) {
            stateVar.timePerQuestion = stateVar.dataJSON.mandatory_config.time_per_question;
            stateVar.timerCountValue = stateVar.dataJSON.mandatory_config.time_per_question;
          }
          this.setState(stateVar);
        }));
    }
  }

  processResultData(resultCardData, quizType) {
    let processedData = [];
    if(quizType === "scoring" && resultCardData[0].upper_limit_of_score_range) {
      let groupedData = Utility.groupBy(resultCardData, "upper_limit_of_score_range"),
        keys = Object.keys(groupedData);

      keys.forEach(key => {
        let tempObj = {};
        groupedData[key].forEach(datum => {
          if(Object.keys(tempObj).length) {
            tempObj.related_articles.push({
              "related_article_links": datum.related_article_links,
              "link_description": datum.link_description,
              "link_image": datum.link_image
            });
          } else {
            tempObj = {
              "upper_limit_of_score_range": datum.upper_limit_of_score_range,
              "message": datum.message,
              "related_articles": [{
                "related_article_links": datum.related_article_links,
                "link_description": datum.link_description,
                "link_image": datum.link_image
              }]
            };
          }
        });
        processedData.push(tempObj);
      });

      processedData.sort(function(a, b) {
        return a.upper_limit_of_score_range - b.upper_limit_of_score_range;
      });

      return processedData;
    } else {
      processedData.push({
        "message": resultCardData[0].message,
        "related_articles": resultCardData.map(function(datum) {
          return {
            "related_article_links": datum.related_article_links,
            "link_description": datum.link_description,
            "link_image": datum.link_image
          };
        })
      });
      return processedData;
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
          restart: 'फिर से शुरू करें ↺',
          next: 'अगला प्रश्न ➜',
          // swipe: 'अगले प्रश्न के लिए दाईं ओर स्वाइप करें ➜'हाँ या ना
          swipe: 'अगले प्रश्न के लिए दाईं या बाईं ओर स्वाइप करें ➜'
        }
        break;
      default:
        text_obj = {
          question_title: "Question ",
          ans_title: "ANSWER",
          restart: 'Good Job! Take the quiz again?',
          next: 'Next Question ➜',
          swipe: 'Swipe on the card to continue ➜'
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
    let countdownValue = document.querySelector(".intro-card .countdown-counter"),
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
    let button = document.querySelector(".intro-button"),
      introCard = document.querySelector(".intro-card"),
      introFront = document.querySelector(".intro-front"),
      firstQCard = document.querySelector(".question-card[data-order='0']"),
      totalQuestions = this.state.totalQuestions,
      config = this.state.dataJSON.mandatory_config;

    introFront.style.display = "none";
    document.querySelector(".intro-back").style.display = "block";

    if(!this.state.isMobile) {
      e.target.style.visibility = "hidden";
      document.querySelector(".intro-cover").style.display = "block";
    }
    introCard.classList.add("clicked");

    this.startCountdown();

    setTimeout(() => {
      introCard.style.top = "-1000px";
      if(!(config.quiz_type === "scoring" && !config.flip_card)) {
        firstQCard.querySelector(".back").style.display = "none";
      }

      firstQCard.classList.add("active");
      firstQCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, 160, 0, 1)`;

      for(let i = 1; i < totalQuestions; i++) {
        let card = document.querySelector(`.question-card[data-order='${i}']`);

        card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${ 160 - (i * 20)}, ${(i * 320 * -1)}, ${(1 + 0.08 * i)})`;
        if(i > 2) {
          card.style.opacity = 0;
        } else {
          card.style.opacity = 1;
        }
      }

      let conclusionCard = document.querySelector(".conclusion-card");
      conclusionCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${160 - ((totalQuestions) * 20)}, ${(totalQuestions * 320 * -1)}, ${(1 + 0.08 * totalQuestions)})`;
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
    let qCard = document.querySelector(".question-card.active"),
      config = this.state.dataJSON.mandatory_config,
      totalQuestions = this.state.totalQuestions,
      cardData = this.state.dataJSON.data.questions[+qCard.getAttribute('data-order')],
      option = cardData.options[+e.target.getAttribute('data-option-id')];

    if(config.quiz_type === "scoring") {
      if(config.timer) {
        this.clearTimer();
        if(!config.flip_card) {
          qCard.querySelector(".front .timer").style.display = "none";
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
    let qCard = document.querySelector(".question-card.active"),
      parent = qCard.querySelector(".content"),
      orderId = qCard.getAttribute("data-order"),
      config = this.state.dataJSON.mandatory_config;

    qCard.setAttribute('data-isNavigable', 1);
    if(!(config.quiz_type === "scoring" && !config.flip_card)) {
      let backDiv = parent.querySelector(".back");

      if(config.quiz_type === "scoring") {
        setTimeout(function() {
          qCard.classList.add("clicked");
          if(option.right_or_wrong) {
            backDiv.querySelector(".wrong-answer").style.display = "none";
            backDiv.querySelector(".correct-answer").classList.remove("deselected");
          } else {
            backDiv.querySelector(".wrong-answer").style.display = "block";
            backDiv.querySelector('.wrong-answer .option-text').innerHTML = option.option;
            backDiv.querySelector(".correct-answer").classList.add("deselected");
          }
          setTimeout(function() {
            parent.querySelector(".front").style.display = "none";
            backDiv.style.display = "block";
          }, 100);
        }, 1100);
      } else {
        qCard.classList.add("clicked");
        setTimeout(function() {
          parent.querySelector(".front").style.display = "none";
          backDiv.style.display = "block";
        }, 100);
        backDiv.querySelector('.correct-answer').innerHTML = option.option;
      }

      if(option.gif_image && option.gif_image.image) {
        backDiv.querySelector(".gif-div").style.display = "block";
        backDiv.querySelector(".gif").onload = function (e) {
          let imgClientRect = e.target.offsetWidth,
            imgContainerClientRect = backDiv.querySelector(".gif-div").offsetWidth,
            idealImgWidth = imgContainerClientRect - 20;

          if(imgClientRect >= idealImgWidth) {
            e.target.style.width = idealImgWidth + "px";
          }
        };
        backDiv.querySelector(".gif").setAttribute("src", option.gif_image.image);
      } else {
        backDiv.querySelector(".gif-div").style.display = "none";
      }

      if(option.fact) {
        backDiv.querySelector(".fact").style.display = "block";
        backDiv.querySelector(".fact").innerHTML = "";
        backDiv.querySelector(".fact").appendChild(document.createTextNode(option.fact));
      } else {
        backDiv.querySelector(".fact").style.display = "none";
      }
    } else {
      if(config.quiz_type === "scoring") {
        let allOptions = parent.querySelectorAll(".option-div"),
          frontDiv = parent.querySelector(".front");

        for(let j = 0; j < allOptions.length; j++) {
          allOptions[j].style.display = "none";
        }
        frontDiv.querySelector(".question").style.color = "#a8a8a8";
        frontDiv.querySelector(".title").style.display = "block";
        frontDiv.querySelector(".answers-container").style.display = "block";
        if(this.state.isMobile) {
          frontDiv.querySelector(".swipe-hint-container").style.display = "block";
        } else {
          frontDiv.querySelector(".next-container").style.display = "block";
        }
        if(option.right_or_wrong) {
          frontDiv.querySelector(".wrong-answer").style.display = "none";
          frontDiv.querySelector(".correct-answer").classList.remove("deselected");
        } else {
          frontDiv.querySelector(".wrong-answer").style.display = "block";
          frontDiv.querySelector('.wrong-answer .option-text').innerHTML = option.option;
          frontDiv.querySelector(".correct-answer").classList.add("deselected");
        }
      }
    }
  }

  swipeCallback(direction) {
    if (this.state.revisitAnswers) {
      return;
    }

    let qCard = document.querySelector(".question-card.active"),
      orderId = +qCard.getAttribute("data-order"),
      mainContainerWidth = document.querySelector(".main-container").offsetWidth,
      nextCard = document.querySelector(".question-card[data-order='" + (orderId + 1) + "']"),
      config = this.state.dataJSON.mandatory_config,
      totalQuestions = this.state.totalQuestions,
      backDiv;

    if (!+qCard.getAttribute('data-isNavigable')) {
      return;
    }

    if(nextCard) {
      if(config.quiz_type === "scoring" && config.timer) {
        this.setState({timerCountValue: this.state.timePerQuestion});
        this.setTimer();
      }
      nextCard.classList.add("active");
      if(!(config.quiz_type === "scoring" && !config.flip_card)) {
        backDiv = nextCard.querySelector(".back");
        backDiv.style.display = "none";
      }
    } else {
      document.querySelectorAll(".progress-bar").forEach((e) => {
        e.style.display = 'none';
      });

      if(!(config.quiz_type === "scoring" && !config.flip_card)) {
        document.querySelectorAll('.question-card .back .swipe-hint-container').forEach((e) => {
          e.style.display = 'none';
        });
        document.querySelectorAll('.question-card .back .next-container').forEach((e) => {
          e.style.display = 'none';
        });
      } else {
        document.querySelectorAll('.question-card .front .swipe-hint-container').forEach((e) => {
          e.style.display = 'none';
        });
        document.querySelectorAll('.question-card .front .next-container').forEach((e) => {
          e.style.display = 'none';
        });
      }
    }

    qCard.classList.remove("active");
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
      let card = document.querySelector(`.question-card[data-order='${i}']`),
        position = (i - orderId - 1);

      card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${ 160 - (position * 20)}, ${(position * 320 * -1)}, ${(1 + 0.08 * position)})`;
      if((i - orderId) < 4) {
        card.style.opacity = 1;
      }
    }

    let conclusionCard = document.querySelector(".conclusion-card"),
      position = totalQuestions - orderId - 1;
    conclusionCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${160 - (position * 20)}, ${(position * 320 * -1)}, ${(1 + 0.08 * position)})`;
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

    let qCard = document.querySelector(".question-card.active"),
      allQuestions = document.querySelectorAll(".question-card"),
      totalQuestions = this.state.totalQuestions,
      config = this.state.dataJSON.mandatory_config,
      i;

    if(qCard) {
      qCard.classList.remove("active");
    }

    for (i = 0;  i < allQuestions.length; i++) {
      let questionElement = allQuestions[i],
        frontElement = questionElement.querySelector(".front"),
        allOptions;

      questionElement.classList.remove("clicked");
      questionElement.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${160 - (i * 20)}, ${(i * 320 * -1)}, ${(1 + 0.08 * i)})`;
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
        allOptions = frontElement.querySelectorAll(".option-div");
        for(let j = 0; j < allOptions.length; j++) {
          allOptions[j].style.display = "block";
        }
        frontElement.querySelector(".question").style.color = "black";
        frontElement.querySelector(".title").style.display = "none";
        frontElement.querySelector(".answers-container").style.display = "none";
        if(this.state.isMobile) {
          frontElement.querySelector(".swipe-hint-container").style.display = "none";
        } else {
          frontElement.querySelector(".next-container").style.display = "none";
        }
        if(config.timer) {
          frontElement.querySelector(".timer").style.display = "block";
          frontElement.querySelector(".timeout-msg").style.display = "none";
        }
      } else {
        questionElement.querySelector('.back').style.display = 'none';
        if(this.state.isMobile) {
          let swipeHint = questionElement.querySelector(".back .swipe-hint-container");
          swipeHint.style.display = "block";
        } else {
          let backNext = questionElement.querySelector(".back .next-container");
          backNext.style.display = "block";
        }
        if(config.quiz_type === "scoring" && config.timer) {
          questionElement.querySelector(".timeout-msg").style.display = "none";
        }
      }
    }

    document.querySelector(".question-card[data-order='0']").classList.add('active');


    let conclusionCard = document.querySelector(".conclusion-card"),
      progressBars = document.querySelectorAll(".progress-bar");

    conclusionCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${160 - (totalQuestions * 20)}, ${(totalQuestions * 320 * -1)}, ${(1 + 0.08 * totalQuestions)})`;
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
    document.querySelectorAll('.question-card').forEach((e) => {
      e.setAttribute('data-isNavigable', 0);
    });
  }

  slideCallback(value) {
    this.setState({sliderValue: value});
    let slider = document.querySelector(".card-slider"),
      sliderWidth = parseFloat(slider.style.width),
      sliderHint = document.querySelector(".slider-hint"),
      cardNum = document.querySelector(".slider-card-no"),
      totalQuestions = this.state.totalQuestions,
      percent = value / totalQuestions * 100,
      conclusionCard = document.querySelector(".conclusion-card");

    slider.style.background = "linear-gradient(to right, #D6EDFF 0%, #168BE5 " + percent + "%, #EEE " + percent + "%)";

    if(isNaN(sliderWidth)) {
      sliderWidth = 270;
    }
    cardNum.innerHTML = (+value + 1) > totalQuestions ? "" : (+value + 1);
    cardNum.style.left = (value / totalQuestions * (sliderWidth - 16) + 4) + "px";

    for(let i = 0; i < totalQuestions; i++) {
      let qCard = document.querySelector(`.question-card[data-order='${i}']`);
      if(i < value) {
        qCard.style.top = "-1000px";
      } else {
        let position = i - value;
        qCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${ 160  - (position * 20)}, ${(i * 320 * -1)}, ${(1 + 0.08 * position)})`;
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

    conclusionCard.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${160 - ((totalQuestions - value) * 20)}, ${(totalQuestions * 320 * -1)}, ${(1 + 0.08 * (totalQuestions - value))})`;
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
    const conclusionCard = document.querySelector('.conclusion-card'),
      conclusionFront = document.querySelector('.conclusion-front'),
      conclusionBack = document.querySelector('.conclusion-back');

    this.setState({revisitAnswers: false});

    if(this.state.revisitAnswers) {
      this.hideSlider();
    }
    conclusionCard.classList.add("clicked");
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
      activeQuestion = document.querySelector('.question-card.active'),
      orderId = +activeQuestion.getAttribute('data-order-id'),
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
          document.querySelector(".question-card.active .front .timer").style.display = "none";
        }
        document.querySelector(".question-card.active .timeout-msg").style.display = "block";
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
    document.querySelector(".slider-hint").style.visibility = "hidden";
    document.querySelector(".slider-card-no").style.display = "block";
  }

  resetSlider(total_questions) {
    let slider = document.querySelector(".card-slider");
    slider.setAttribute("value", total_questions);
    slider.style.background = "linear-gradient(to right, #D6EDFF 0%, #168BE5 100%, #EEE 100%)";
  }

  showSlider() {
    document.querySelector(".card-slider").style.display = "block";
    document.querySelector(".slider-container").style.display = "block";
  }

  hideSlider() {
    document.querySelector(".card-slider").style.display = "none";
    document.querySelector(".slider-container").style.display = "none";
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

  renderIntroCard() {
    const buttonStyle = {},
      introFrontStyle = {};

    const data = this.state.dataJSON.data,
      introCardConfigs = {
        background_image: data.basic_datapoints.background_image.image,
        quiz_title: data.basic_datapoints.quiz_title,
        introduction: data.basic_datapoints.introduction,
        start_button_text: data.basic_datapoints.start_button_text,
        start_button_color: this.state.optionalConfigJSON.start_button_color,
        start_button_text_color: this.state.optionalConfigJSON.start_button_text_color
      };

    introCardConfigs.start_button_color ? buttonStyle.backgroundColor = introCardConfigs.start_button_color : undefined;
    introCardConfigs.start_button_text_color ? buttonStyle.color = introCardConfigs.start_button_text_color : undefined;

    if(introCardConfigs.background_image) {
      introFrontStyle.backgroundImage = "url(" + introCardConfigs.background_image + ")";
    }

    return (
      <div className="intro-container">
        <div
          id={ this.props.mode === 'screenshot' ? "ProtoScreenshot" : undefined }
          className={`${introCardConfigs.background_image || this.state.mode === 'laptop' ? 'intro-content with-image' : 'intro-content'}`}>
          <div className={`${introCardConfigs.background_image && this.state.isMobile ? 'intro-header with-image' : 'intro-header'}`}>
            {introCardConfigs.quiz_title}
          </div>
          <div className={`${introCardConfigs.background_image && this.state.isMobile ? 'intro-description with-image' : 'intro-description'}`}>
            {introCardConfigs.introduction}
          </div>
          <div className="intro-button-div">
            <button className="intro-button" onClick={(e) => this.startQuiz(e)} style={buttonStyle}>
              {introCardConfigs.start_button_text}
            </button>
          </div>
        </div>
        <div className="intro-cover"></div>
      </div>
    );
  }

  renderCorrectIndicator() {
    return (
      <div id="correct_indicator" className="correct-wrong-indicator correct-background">
        <div className="tick-background">
          <span className="correct-tick">&#10004;&#xFE0E;</span>
        </div>
        <div className="correct-wrong-text">Correct</div>
      </div>
    );
  }

  renderWrongIndicator() {
    return (
      <div id="wrong_indicator" className="correct-wrong-indicator wrong-background">
        <div className="tick-background wrong-tick">
          <span>&#10007;&#xFE0E;</span>
        </div>
        <div className="correct-wrong-text wrong">Wrong</div>
      </div>
    );
  }

  renderTimeOutIndicator () {
    return (
      <div id="time_out_indicator" className="time-out-indicator">
        <div className="time-out-content">
          <div className="clock-icon">
            <img src={`${this.props.baseURL}/images/clock-large.png`} />
          </div>
          <div className="time-value">00:00</div>
          <div className="oops-msg">Oops!</div>
          <div className="times-up-msg">Time's up</div>
        </div>
      </div>
    );
  }

  renderMainContainerContent(cards) {
    const events = {
      resetQuiz: ((e) => this.resetQuiz(e)),
      revisitAnswers: ((e) => this.revisitAnswers(e)),
      socialShare: ((e) => this.socialShare(e))
    },
    data = this.state.dataJSON.data,
    introCardConfigs = {
      background_image: data.basic_datapoints.background_image.image,
      quiz_title: data.basic_datapoints.quiz_title,
      introduction: data.basic_datapoints.introduction,
      start_button_text: data.basic_datapoints.start_button_text,
      start_button_color: this.state.optionalConfigJSON.start_button_color,
      start_button_text_color: this.state.optionalConfigJSON.start_button_text_color
    },
    cardConfigs = this.state.dataJSON.mandatory_config;
    cardConfigs.share_msg = data.basic_datapoints.share_msg;
    cardConfigs.share_link = data.basic_datapoints.share_link;

    return (
      <div id="protograph_toQuiz" className="quiz-container">
        <div className="quiz-content">
          { (this.props.mode === 'laptop' || this.props.mode === 'edit')  && this.renderIntroCard() }
          <div id="main_container" className="main-container">
            <div id="fb-root"></div>

            { this.renderCorrectIndicator() }
            { this.renderWrongIndicator() }
            { this.renderTimeOutIndicator() }

            <IntroductionCard
              introCardConfigs={introCardConfigs}
              startQuiz={((e) => this.startQuiz(e))}
              totalQuestions={this.state.totalQuestions}
              isMobile={this.state.isMobile}
            />

            <div id="card_stack" className="card-stack">
              {cards}
              {
                this.state.isMobile ? <div className='help-text' id="help_text">{this.state.languageTexts.swipe}</div> : undefined
              }
            </div>

            <ResultCard
              introCardConfigs={introCardConfigs}
              cardConfigs={this.state.dataJSON.mandatory_config}
              resultCardConfigs={this.state.dataJSON.data.result_card_data}
              totalQuestions={this.state.totalQuestions}
              score={this.state.score}
              cardEvents={events}
              baseURL={this.props.baseURL}
            />

            <div className="slider-container">
              <div className="slider-hint">use slider to move between questions</div>
              <span className="slider-card-no">5</span>
              <input
                className="card-slider"
                name="card_slider"
                type="range"
                step="1"
                min="0"
                max={this.state.totalQuestions}
                value={this.state.sliderValue}
                onInput={((e) => { this.slideCallback(e.target.value); })}
                onMouseDown={!this.state.isMobile ? ((e) => this.sliderMousedownCallback(e)) : undefined}
                onTouchStart={this.state.isMobile ? ((e) => this.sliderMousedownCallback(e)) : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderQuiz() {
    if (this.state.fetchingData) {
      return (
        <div className='quiz-container'>
          <div className="loading-card" style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', opacity:1, zIndex: 500}}>
            <span className="loading-text" style={{position:'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
              Fetching Questions ...
            </span>
          </div>
        </div>
      )
    } else {
      let styles = {},
        x = 140, //(this.state.totalQuestions * 20) - 20,
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

        x = x - 20;
        y = y - 320;
        z = z + 0.08;

        events.optionClick = ((e) => this.optionClicked(e));
        if (this.state.isMobile) {
          events.onTouchStart = ((e) => Touch.swipeStart(e));
          events.onTouchMove = ((e) => Touch.swipeMove(e));
          events.onTouchEnd = ((e) => this.touchEndHandler(e));
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
          />
        )
      });

      return this.renderMainContainerContent(qCards)
    }
  }

  renderScreenshot() {
    if (this.state.fetchingData) {
      return (
        <div className='quiz-container'>
          <div className="loading-card" style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', opacity:1, zIndex: 500}}>
            <span className="loading-text" style={{position:'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
              Fetching Questions ...
            </span>
          </div>
        </div>
      )
    } else {
      return (
        <div className="quiz-container">
          <div className="quiz-content">
            { this.renderIntroCard() }
          </div>
        </div>
      )
    }
  }

  render() {
    switch(this.props.mode) {
      case 'laptop':
        return this.renderQuiz();
        break;
      case 'mobile':
        return this.renderQuiz();
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