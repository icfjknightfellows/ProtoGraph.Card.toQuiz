import React      from 'react';
import ReactDOM   from 'react-dom';
import axios      from 'axios';
import Card       from './Card.jsx';
import Scss       from '../css/container.scss'
import Utility    from './utility.js';
import Touch      from './touch.js';
import LoadData   from './load_data.js';
import IntroductionCard  from '../cards/quiz-introduction.jsx';
import ResultCard from '../cards/quiz-conclusion.jsx';

class Container extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetchingQuestions: true,
      questionsData: [],
      commonConfigs: {},
      introCardConfigs: {},
      resultCardConfigs: undefined,
      languageTexts: {},
      totalQuestions: 0,
      score: 0,
      rightCounter: 0,
      cardHeight: 300,
      backHeightWithoutFact: undefined,
      sliderValue: 0,
      timerCountValue: 10,
      timePerQuestion: 30,
      questionScore: 1,
      timer: undefined,
      isMobile: window.innerWidth <= 500
    };
  }

  processQuestionsData(questionsData) {
    let groupedData = Utility.groupBy(questionsData, 'question_no'),
      keys = Object.keys(groupedData),
      processedData = [];

    keys.forEach(key => {
      let tempObj = {};
      groupedData[key].forEach(datum => {
        if(Object.keys(tempObj).length) {
          tempObj.options.push({
            option: datum.options,
            correct_answer: datum.correct_answer,
            gif_image: datum.gif_image,
            fact: datum.description,
            right_or_wrong: datum.right_or_wrong ? (datum.right_or_wrong.toLowerCase() === 'right' ? true : false) : false
          });
        } else {
          tempObj = {
            "question": datum.question,
            "question_no": datum.question_no,
            "options": [{
              option: datum.options,
              correct_answer: datum.correct_answer,
              gif_image: datum.gif_image,
              fact: datum.description,
              right_or_wrong: datum.right_or_wrong ? (datum.right_or_wrong.toLowerCase() === 'right' ? true : false) : false
            }]
          };
        }
      });
      processedData.push(tempObj);
    });
    return processedData;
  }

  processCommonConfigs(commonConfigs) {
    return {
      language: commonConfigs.language,
      quiz_type: commonConfigs.quiz_type,
      timer: commonConfigs.timer ? (commonConfigs.timer.toLowerCase() === 'yes' ? true : false ) : false,
      time_per_question: commonConfigs.time_per_question,
      flip_card: commonConfigs.flip_card ? (commonConfigs.flip_card.toLowerCase() === 'yes' ? true : false ) : false,
      revisit_answers: commonConfigs.revisit_answers ? (commonConfigs.revisit_answers.toLowerCase() === 'yes' ? true : false ) : false,
      social_share: commonConfigs.social_share ? (commonConfigs.social_share.toLowerCase() === 'yes' ? true : false ) : false,
      share_link: commonConfigs.share_link,
      share_msg: commonConfigs.share_msg
    }
  }

  processResultData(resultCardData, config) {
    let processedData = [];
    if(config.quiz_type === "scoring" && resultCardData[0].upper_limit_of_score_range) {
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

  componentDidMount() {
    const sheet = Utility.getURLParam('sheet'),
      json = Utility.getURLParam('json');

    if (sheet) {
      LoadData.loadSheetData(sheet, sheetData => {
        let stateVar = {
          fetchingQuestions: false,
          questionsData: this.processQuestionsData(sheetData.quiz.elements),
          commonConfigs: this.processCommonConfigs(sheetData.common_configs.elements[0]),
          introCardConfigs: sheetData.intro_card_configs.elements[0],
          totalCards: (sheetData.quiz.elements.length + 2),
          totalQuestions: sheetData.quiz.elements.length,
          sliderValue: 0
        };

        stateVar.languageTexts = this.getLanguageTexts(stateVar.commonConfigs);
        stateVar.resultCardConfigs = sheetData.result_card.elements ? this.processResultData(sheetData.result_card.elements, stateVar.commonConfigs) : undefined;

        if (stateVar.commonConfigs.time_per_question) {
          stateVar.time_per_question = stateVar.commonConfigs.time_per_question;
          stateVar.timer_count_value = stateVar.commonConfigs.time_per_question;
        }

        // console.log({
        //   questionsData: stateVar.questionsData,
        //   commonConfigs: stateVar.commonConfigs,
        //   introCardConfigs: stateVar.introCardConfigs,
        //   resultCardConfigs: stateVar.resultCardConfigs })
        this.setState(stateVar);
      });
    } else if (json) {

    }
  }

  getLanguageTexts(config) {
    let language = config ? config.language : "english",
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
      text_obj.next = config.next_button_text || text_obj.next;
      text_obj.restart = config.replay_button_text || text_obj.restart;
      text_obj.swipe = config.swipe_hint_text || text_obj.swipe;
    }

    return text_obj;
  }

  formatNumber(n) {
    return n > 9 ? "" + n : "0" + n;
  }

  startCountdown() {
    let countdown_value = document.querySelector('.question-card[data-card-type="intro"] .countdown-counter'),
      countdown_interval,
      counter = 3;

    countdown_interval = setInterval(function() {
      counter--;
      if(counter > 0) {
        countdown_value.innerHTML = counter;
      } else if(counter === 0) {
        countdown_value.innerHTML = "GO";
      } else {
        clearInterval(countdown_interval);
      }
    }, 1000);
  }

  // EVENTS
  startQuiz(e) {
    let q_card = document.querySelector(".question-card.active"),
      card_no = +q_card.getAttribute("data-card-no"),
      main_container_width = document.querySelector(".main-container").offsetWidth,
      back_div,
      config = this.state.commonConfigs;

    e.target.style.display = "none";
    q_card.classList.add("clicked");
    q_card.classList.remove("active");

    this.startCountdown();

    setTimeout(() => {
      q_card.style.top = "-1000px";
      // if(!(config.quiz_type === "scoring" && config.flip_card === "no")) {
      //   first_q_card.querySelector(".back").style.display = "none";
      // }
      let next_card = document.querySelector(".question-card[data-card-no='" + (card_no + 1) + "']");
      if(next_card) {
        next_card.classList.add("active");
      }

      for(let i = (card_no + 1), count = 0; i < total_cards; i++, count++) {
        let card = document.querySelector(".question-card[data-card-no='" + i + "']"),
          position = (i - card_no - 1);

        card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${(((total_cards) - position) * 16)},  ${(position * 320 * -1)} , ${(1 + 0.08 * position)})`;
        // card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + (((total_cards) - position) * 24) + ", " + (position * 320 * -1) + ", " + (1 + 0.16 * position) + ")";
        if(count > 2) {
          card.style.opacity = 0;
        } else {
          card.style.opacity = 1;
        }
      }

      if(config.quiz_type === "scoring" && config.timer === "yes") {
        this.setTimer();
      }

    }, 4000);

    // if(config.quiz_type === "scoring") {
    //   let conclusion_card = document.querySelector(".conclusion-card"),
    //     position = total_cards - card_no - 1;
    //   conclusion_card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + (((total_cards) - position) * 24) + ", " + (position * 320 * -1) + ", " + (1 + 0.16 * position) + ")";
    // }
  }

  optionClicked(e) {
    let q_card = e.target.closest(".question-card"),
      question_no = +q_card.getAttribute('data-question-no'),
      card_no = +q_card.getAttribute('data-card-no'),
      parent = e.target.closest(".content"),
      back_div,
      config = this.state.commonConfigs,
      total_questions = this.state.totalQuestions,
      card_data = this.state.card_data[card_no],
      option = card_data.options[+e.target.getAttribute('data-option-id')],
      result_card_data = this.state.resultCardConfigs;

    if(config.quiz_type === "scoring") {
      if(config.timer === "yes") {
        this.clearTimer();
      }
      if(option.right_or_wrong === "right") {
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
  }

  nextCard(e) {
    let q_card = document.querySelector(".question-card.active"),
      card_no = +q_card.getAttribute("data-card-no"),
      main_container_width = document.querySelector(".main-container").offsetWidth,
      back_div;

    e.target.style.display = "none";

    q_card.classList.remove("active");
    q_card.style.left = (main_container_width + 500) + "px";

    let next_card = document.querySelector(".question-card[data-card-no='" + (card_no + 1) + "']");
    if(next_card && card_no + 1 < total_cards - 1) {
      next_card.classList.add("active");
        back_div = next_card.querySelector(".back");
        back_div.style.display = "none";
    }

    for(let i = (card_no + 1), count = 0; i < total_cards; i++, count++) {
      let card = document.querySelector(".question-card[data-card-no='" + i + "']"),
        position = (i - card_no - 1);
      card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${(((total_cards) - position) * 16)},  ${(position * 320 * -1)} , ${(1 + 0.08 * position)})`;
      if(count > 2) {
        card.style.opacity = 0;
      } else {
        card.style.opacity = 1;
      }

    }
    if(config.quiz_type === "scoring" && config.timer === "yes") {
      this.setTimer();
    }
  }

  resetQuiz(e) {
    this.setState({
      right_counter: 0,
      score: 0
    });

    let q_card = document.querySelector(".question-card.active"),
      all_questions = document.querySelectorAll(".question-card:not([data-card-type='intro'])"), // instead can do data-card-type='qa' but its not done as we can have cards in between the question card stack that we want users to revisit.
      total_questions = this.state.totalQuestions,
      config = this.state.commonConfigs,
      i;

    if(q_card) {
      q_card.classList.remove("active");
    }

    for (i = 0;  i < all_questions.length; i++) {
      let question_element = all_questions[i],
        front_element = question_element.querySelector(".front"),
        all_options;

      question_element.classList.remove("clicked");
      question_element.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${(((total_cards) - i) * 16)},  ${(i * 320 * -1)} , ${(1 + 0.08 * i)})`;
      question_element.style.display = "block";
      front_element.style.display = "block";
      // question_element.style.left = "50%";
      question_element.style.top = "0px";

      if(i < 3) {
        question_element.style.opacity = 1;
      } else {
        question_element.style.opacity = 0;
      }

      if(config.quiz_type === "scoring") {
        if(config.flip_card === "no") {
          // removeTouchEvents(front_element);
          all_options = front_element.querySelectorAll(".option-div");
          for(let j = 0; j < all_options.length; j++) {
            // all_options[j].style.pointerEvents = "auto";
            all_options[j].style.display = "block";
          }
          front_element.querySelector(".question").style.color = "black";
          front_element.querySelector(".title").style.display = "none";
          front_element.querySelector(".answers-container").style.display = "none";
          front_element.querySelector(".swipe-hint-container").style.display = "none";
        } else {
          let back_element = question_element.querySelector(".back"),
            swipe_hint = back_element.querySelector(".swipe-hint-container");
          // addTouchEvents(back_element, config, total_cards);
          if (swipe_hint) {
            swipe_hint.style.display = "block";
          }
        }
      }
    }

    document.querySelector(".question-card[data-question-no='1']").classList.add('active');

    let conclusion_card = document.querySelector(".question-card[data-card-type='score']"),
      progress_bars = document.querySelectorAll(".progress-bar");

    // conclusion_card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, 0, ${(total_cards * 320 * -1)}, ${(1 + 0.08 * total_cards)})`;

    for(let i = 0; i < progress_bars.length; i++) {
      progress_bars[i].style.display = "block";
    }

    this.hideSlider();

    if(config.quiz_type === "scoring") {
      if(config.timer === "yes") {
        this.setTimer();
      }
    }
  }

  revisitAnswers(e) {
    this.showSlider();
    this.slideCallback(0);
  }

  slideCallback(value) {
    this.setState({sliderValue: value});
    let total_questions = this.state.totalQuestions,
      slider = document.querySelector(".card-slider"),
      percent = value / total_questions * 100,
      conclusion_card = document.querySelector(".question-card[data-card-type='score']");

    slider.style.background = "linear-gradient(to right, #D6EDFF 0%, #168BE5 " + percent + "%, #EEE " + percent + "%)";

    for(let i = 1; i < total_questions; i++) {
      let q_card = document.querySelector(`.question-card[data-question-no='${i}']`);
      if(i < value) {
        q_card.style.top = "-1000px";
      } else {
        let order_no = i - value;

        q_card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${(((total_questions) - order_no) * 24)}, ${(order_no * 320 * -1)}, ${(1 + 0.16 * order_no)})`
        q_card.style.display = "block";
        // q_card.style.left = "50%";
        q_card.style.top = "0px";
      }
    }
    conclusion_card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${(value * 16)}, ${(total_questions * 320 * -1)}, ${(1 + 0.08 * (total_questions - value))})`
    if((total_questions - value) < 3) {
      setTimeout(function() {
        conclusion_card.style.opacity = 1;
      }, 300);
    } else {
      setTimeout(function() {
        conclusion_card.style.opacity = 0;
      }, 300);
    }
  }

  swipeCallback(direction) {
    let q_card = document.querySelector(".question-card.active"),
      card_no = +q_card.getAttribute("data-card-no"),
      question_no = +q_card.getAttribute("data-question-no"),
      main_container_width = document.querySelector(".main-container").offsetWidth,
      next_card = document.querySelector(".question-card[data-card-no='" + (card_no + 1) + "']"),
      config = this.state.commonConfigs,
      back_div;

    if(next_card && card_no + 1 < total_cards - 1) {
      next_card.classList.add("active");
      if(!(config.quiz_type === "scoring" && config.flip_card === "no")) {
        back_div = next_card.querySelector(".back");
        back_div.style.display = "none";
      }
      if(config.quiz_type === "scoring" && config.timer === "yes") {
        this.setTimer();
      }
    } else {
      if(config.quiz_type === "scoring") {
        let progress_bars = document.querySelectorAll(".progress-bar");

        for(let i = 0; i < progress_bars.length; i++) {
          progress_bars[i].style.display = "none";
        }

        if(config.flip_card === "yes") {
          let swipe_container = document.querySelectorAll(".question-card[data-card-type='qa'] .back .swipe-hint-container");
          swipe_container.forEach((e) => {
            e.style.display = 'none';
          });
        } else {
          let swipe_container = document.querySelectorAll(".question-card[data-card-type='qa'] .front .swipe-hint-container");
          swipe_container.forEach((e) => {
            e.style.display = 'none';
          });
        }
      }
    }

    document.getElementById('next').style.display = "none";
    q_card.classList.remove("active");

    switch(direction) {
      case "left":
        q_card.style.left = "-1000px";
        break;
      case "right":
        q_card.style.left = (main_container_width + 500) + "px";
        break;
      case "up":
        q_card.style.top = "-1000px";
        break;
    }

    for(let i = (card_no + 1), count = 0; i < total_cards; i++, count++) {
      let card = document.querySelector(".question-card[data-card-no='" + i + "']"),
        position = (i - card_no - 1);

      card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${(((total_cards) - position) * 16)}, ${(position * 320 * -1)}, ${(1 + 0.08 * position)})`;
      count > 2 ? card.style.opacity = 0 : card.style.opacity = 1;
    }
  }

  touchEndHandler(event) {
    Touch.swipeEnd(event,
      ((e) => { console.log("swipeLeft"); }),
      ((e) => { console.log("swipeRight"); }),
      ((e) => { this.swipeCallback("up"); }),
      ((e) => { console.log("swipeRight"); })
    );
  }

  setTimer() {
    if(this.state.timer) {
      this.clearTimer();
    }
    let counter = this.state.timePerQuestion,
      active_question = document.querySelector(".question-card.active"),
      card_no = +active_question.getAttribute('data-card-no'),
      question_no = +active_question.getAttribute('data-question-no'),
      options = this.state.card_data[card_no].options,
      question_score = counter;

    this.setState({ question_score: counter });
    const timeInterval = setInterval(() => {
      counter--;

      this.setState({
        timer_count_value: counter,
        question_score: counter
      })

      if(counter === 0) {
        this.clearTimer();
        this.flashTimeUpIndicator();
        this.addOptionBasedContent(options.filter((e) => { return e.right_or_wrong === 'right'; })[0]);
      }
    }, 1000);

    this.setState({
      timer: timeInterval
    });
  }

  clearTimer() {
    clearInterval(this.state.timer);
    this.setState({ timer: undefined });
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

  resetSlider(total_questions) {
    let slider = document.querySelector(".card-slider");
    slider.setAttribute("value", total_questions);
    slider.style.background = "linear-gradient(to right, #D6EDFF 0%, #168BE5 100%, #EEE 100%)";
  }

  addOptionBasedContent(option) {
    let q_card = document.querySelector(".question-card.active"),
      parent = q_card.querySelector(".content"),
      card_no = q_card.getAttribute("data-card-no"),
      question_no = q_card.getAttribute('data-question-no'),
      config = this.state.commonConfigs;

    if(!(config.quiz_type === "scoring" && config.flip_card === "no")) {
      let back_div = parent.querySelector(".back");
      back_div.style.display = "block";

      if(config.quiz_type === "scoring") {
        setTimeout(function() {
          q_card.classList.add("clicked");
          if(option.right_or_wrong === "right") {
            back_div.querySelector(".wrong-answer").style.display = "none";
            back_div.querySelector(".correct-answer").classList.remove("deselected");
          } else {
            back_div.querySelector(".wrong-answer").style.display = "block";
            back_div.querySelector('.wrong-answer .option-text').innerHTML = option.option;
            back_div.querySelector(".correct-answer").classList.add("deselected");
          }
          parent.querySelector(".front").style.display = "none";
        }, 1100);
      } else {
        q_card.classList.add("clicked");
        parent.querySelector(".front").style.display = "none";
        back_div.querySelector('.correct-answer').innerHTML = option.option;
      }

      if(option.answer_description) {
        back_div.querySelector(".answer").style.display = "block";
        back_div.querySelector(".answer").innerHTML = "";
        back_div.querySelector(".answer").appendChild(document.createTextNode(option.answer_description));
      } else {
        back_div.querySelector(".answer").style.display = "none";
      }

      if(option.gif_image) {
        back_div.querySelector(".gif-div").style.display = "block";
        back_div.querySelector(".gif").onload = function (e) {
          let img_client_rect = e.target.offsetWidth,
            img_container_client_rect = back_div.querySelector(".gif-div").offsetWidth,
            ideal_img_width = img_container_client_rect - 20;

          if(img_client_rect >= ideal_img_width) {
            e.target.style.width = ideal_img_width + "px";
          }
        };
        back_div.querySelector(".gif").setAttribute("src", option.gif_image);
      } else {
        back_div.querySelector(".gif-div").style.display = "none";
      }

      if(option.fact) {
        back_div.querySelector(".fact").style.display = "block";
        back_div.querySelector(".fact").innerHTML = "";
        back_div.querySelector(".fact").appendChild(document.createTextNode(option.fact));
      } else {
        back_div.querySelector(".fact").style.display = "none";
      }
    } else {
      if(config.quiz_type === "scoring") {
        let all_options = parent.querySelectorAll(".option-div"),
          front_div = parent.querySelector(".front");

        for(let j = 0; j < all_options.length; j++) {
          all_options[j].style.display = "none";
        }

        front_div.querySelector(".question").style.color = "grey";
        front_div.querySelector(".title").style.display = "block";
        front_div.querySelector(".answers-container").style.display = "block";
        front_div.querySelector(".swipe-hint-container").style.display = "block";
        if(option.right_or_wrong === "right") {
          front_div.querySelector(".wrong-answer").style.display = "none";
          front_div.querySelector(".correct-answer").classList.remove("deselected");
        } else {
          front_div.querySelector(".wrong-answer").style.display = "block";
          front_div.querySelector('.wrong-answer .option-text').innerHTML = option.option;
          front_div.querySelector(".correct-answer").classList.add("deselected");
        }
      }
    }
  }

  showSlider() {
    document.querySelector(".card-slider").style.display = "block";
  }

  hideSlider() {
    document.querySelector(".card-slider").style.display = "none";
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

  // getMaxContentCardDataIndexes() {
  //   let q_index = 0,
  //     o_index = 0,
  //     max_length = 0;

  //   this.card_data.forEach((q, i) => {
  //     q.options.forEach((o, j) => {
  //       let length = 0;

  //       if(o.fact) {
  //         length += o.fact.length;
  //       }
  //       if(length > max_length) {
  //         max_length = length;
  //         q_index = i;
  //         o_index = j;
  //       }
  //     });
  //   });

  //   return {
  //     q_index: q_index,
  //     o_index: o_index
  //   }
  // }

  renderMainContainerContent(cards) {
    if (this.state.fetchingQuestions) {
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
            {
              !this.state.isMobile ?
                <div className="intro-container">
                  <div className="intro-content">
                    <div className="intro-header"></div>
                    <div className="intro-description"></div>
                    <div className="intro-button-div">
                      <button className="intro-button"></button>
                    </div>
                  </div>
                  <div className="intro-cover"></div>
                </div>
              :
                undefined
            }
            <div id="main_container" className="main-container">
              <div id="fb-root"></div>
              <div id="correct_indicator" className="correct-wrong-indicator correct-background">
                <div className="tick-background">
                  <span className="correct-tick">&#10004;&#xFE0E;</span>
                </div>
                <div className="correct-wrong-text">Correct</div>
              </div>
              <div id="wrong_indicator" className="correct-wrong-indicator wrong-background">
                <div className="tick-background wrong-tick">
                  <span>&#10007;&#xFE0E;</span>
                </div>
                <div className="correct-wrong-text wrong">Wrong</div>
              </div>
              <div id="time_out_indicator" className="time-out-indicator">
                <div className="time-out-content">
                  <div className="clock-icon">
                    <img src="src/images/clock-large.png" />
                  </div>
                  <div className="time-value">00:00</div>
                  <div className="oops-msg">Oops!</div>
                  <div className="times-up-msg">Time's up</div>
                </div>
              </div>

              <IntroductionCard
                introCardConfigs={this.state.introCardConfigs}
                startQuiz={((e) => this.startQuiz(e))}
              />

              <div id="card_stack" className="card-stack">
                {cards}
                {
                  this.state.isMobile ? <div className='help-text' id="help_text">{this.state.languageTexts.swipe}</div> : undefined
                }
              </div>

              <ResultCard
                introCardConfigs={this.state.introCardConfigs}
                cardConfigs={this.state.commonConfigs}
                resultCardConfigs={this.state.resultCardConfigs}
                totalQuestions={this.state.totalQuestions}
                score={this.state.score}
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
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  // getCardHeight() {
  //   let max_height = this.state.card_height,
  //     total_cards = this.state.total_cards,
  //     total_questions = this.state.total_questions,
  //     intro_header_bcr = document.querySelector(".intro-header").offsetHeight,
  //     intro_desc_bcr = document.querySelector(".intro-description").offsetHeight,
  //     intro_button_bcr = document.querySelector(".intro-button").offsetHeight,
  //     intro_height = (intro_header_bcr + intro_desc_bcr + intro_button_bcr + 50),
  //     dimension_obj = {};

  //   if(intro_height > max_height) {
  //     max_height = intro_height;
  //   }

  //   if(!(config.quiz_type === "scoring" && config.flip_card === "no")) {
  //     let max_back = document.querySelector(".max-content"),
  //       b_title = max_back.querySelector(".title").offsetHeight,
  //       b_ans = max_back.querySelector(".answers-container").offsetHeight,
  //       b_gif = 150,
  //       b_fact = max_back.querySelector(".fact").offsetHeight,
  //       b_num = max_back.querySelector(".question-number").offsetHeight,
  //       b_swipe = max_back.querySelector(".swipe-hint-container").offsetHeight,
  //       back_height = b_title + b_ans + b_gif + b_fact + b_num + b_swipe + 85;

  //     dimension_obj.back_height_without_fact = back_height - b_fact;

  //     if(back_height > max_height) {
  //       max_height = back_height;
  //     }
  //   }

  //   for(let i = 0; i < questions.length; i++) {
  //     let q_title = 0,
  //       q_options = questions[i].querySelectorAll(".option-div"),
  //       q_num = questions[i].querySelector(".question-number").offsetHeight,
  //       q_que = questions[i].querySelector(".question").offsetHeight,
  //       q_height,
  //       order_id = +questions[i].getAttribute("data-order");

  //     q_height = q_title + q_que + q_num + 100;

  //     for(let j = 0; j < q_options.length; j++) {
  //       q_height += (q_options[j].offsetHeight + 15);
  //     }

  //     if(q_height > max_height) {
  //       max_height = q_height;
  //     }
  //     questions[i].style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + ((total_questions - 1 - order_id) * 20) + ", " + ((order_id + 1) * 320 * -1) + ", " + (1 + 0.08 * (order_id + 1)) + ")";
  //     if(i > 1) {
  //       questions[i].style.opacity = 0;
  //     }
  //   }

  //   let conclu_result = document.querySelector(".conclusion-card .result-container").offsetHeight,
  //     conclu_buttons = document.querySelector(".conclusion-card .buttons-container").offsetHeight,
  //     conclu_links = document.querySelector(".conclusion-card .links-container").offsetHeight,
  //     slider_height = document.querySelector(".slider-container").offsetHeight,
  //     conclu_height = (conclu_result + conclu_buttons + conclu_links + slider_height + 235); //45 + 20 + 70 *2 + 50
  //   console.log("conclu_result", conclu_result);
  //   console.log("conclu_buttons", conclu_buttons);
  //   console.log("conclu_links", conclu_links);
  //   console.log("conclu_height", conclu_height);
  //   if(conclu_height > max_height) {
  //     max_height = conclu_height;
  //   }

  //   if(max_height > card_height) {
  //     card_height = max_height;
  //   }
  //   dimension_obj.card_height = card_height;
  //   return dimension_obj;
  // }

  render() {
    let styles = {},
      x = this.state.totalQuestions * 16,
      y = 0,
      z = 1,
      cards,
      question_card_count = 0;

    if(this.state.commonConfigs.font_family) {
      document.querySelector('.main-container').style.fontFamily = this.state.commonConfigs.font_family;
    }

    cards = this.state.questionsData.map((card, i) => {
      const style = {},
        events = {};

      style.zIndex = this.state.totalQuestions - i;
      style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${x}, ${y}, ${z})`;

      if(i < 3) {
        style.opacity = 1;
      } else {
        style.opacity = 0;
      }

      x = x - 16;
      y = y - 320;
      z = z + 0.08;

      // events.startQuiz = ((e) => this.startQuiz(e));
      events.optionClick = ((e) => this.optionClicked(e));
      events.nextCard = ((e) => this.nextCard(e));

      if (this.state.isMobile) {
        events.onTouchStart = ((e) => Touch.swipeStart(e));
        events.onTouchMove = ((e) => Touch.swipeMove(e));
        events.onTouchEnd = ((e) => this.touchEndHandler(e));
      }

      // events.resetQuiz = ((e) => this.resetQuiz(e));
      // events.revisitAnswers = ((e) => this.revisitAnswers(e));

      return (
        <Card
          key={i}
          cardNo={i}
          questionNo={this.formatNumber(i + 1)}
          cardStyle={style}
          cardData={this.state.questionsData[i]}
          cardEvents={events}
          cardConfigs = {this.state.commonConfigs}
          languageTexts={this.state.languageTexts}
          totalQuestions={this.formatNumber(this.state.totalQuestions)}
          isMobile={this.state.isMobile}
          timerValue={this.calculateTime(this.state.timerCountValue)} />
      )
    });

    return this.renderMainContainerContent(cards)
  }
}

export default Container;

