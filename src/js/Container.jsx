import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Card from './Card.jsx';
import Scss from '../css/container.scss'
import Utility from './utility.js';
import Touch from "./touch.js";

class Container extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetching_questions: true,
      card_meta_data: [],
      card_data: [],
      configs: {},
      intro_card_configs: {},
      result_card_configs: {},
      language_texts: {},
      total_cards: 0,
      total_questions: 0,
      score: 0,
      right_counter: 0,
      card_height: 300,
      sliderValue: 0,
      is_mobile: window.innerWidth <= 500
    };
  }

  componentDidMount() {
    axios.all([axios.get(this.props.containerURL), axios.get(this.props.dataURL)])
      .then(axios.spread((cont, card) => {
        //Note this call is async.
        this.setState({
          fetching_questions: false,
          card_meta_data: cont.data.cards,
          card_data: card.data.root.row,
          configs: cont.data.configurations.common_configs,
          intro_card_configs: cont.data.configurations.intro_card_configs,
          result_card_configs: this.processResultData(cont.data.configurations.result_card),
          language_texts: this.getLanguageTexts(cont.data.configurations.common_configs),
          total_cards: cont.data.cards.length,
          total_questions: cont.data.cards.reduce((prev, curr) => {
            if (curr.card_type === 'qa') {
              return prev + 1;
            } else {
              return prev
            }
          }, 0),
          sliderValue: 0
        });

      }));
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

  processResultData(result_card_data) {
    let grouped_data = Utility.groupBy(result_card_data, "score_range_higher_mark"),
      keys = Object.keys(grouped_data),
      processed_data = [];

    keys.forEach(key => {
      let temp_obj = {};
      grouped_data[key].forEach(datum => {
        if(Object.keys(temp_obj).length) {
          temp_obj.related_article_links.push(datum.related_article_links);
        } else {
          temp_obj = {
            "score_range_higher_mark": datum.score_range_higher_mark,
            "message": datum.message,
            "related_article_links": [datum.related_article_links]
          };
        }
      });
      processed_data.push(temp_obj);
    });
    processed_data.sort(function(a, b) {
      return a.score_range_higher_mark - b.score_range_higher_mark;
    })
    return processed_data;
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
      total_cards = this.state.total_cards;

    e.target.style.display = "none";
    q_card.classList.add("clicked");
    q_card.classList.remove("active");

    this.startCountdown();

    setTimeout(function() {
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
      config = this.state.configs,
      total_questions = this.state.total_questions,
      total_cards = this.state.total_cards,
      card_data = this.state.card_data[card_no],
      option = card_data.options[+e.target.getAttribute('data-option-id')],
      result_card_data = this.state.result_card_configs;

    if(config.quiz_type === "scoring") {
      if(option.right_or_wrong === "right") {
        //Note this call is async.
        this.setState((prevState, props) => {
          return {
            right_counter: prevState.right_counter + 1,
            score: prevState.score + 1
          };
        });
        // right_counter++;
        this.flashCorrectIndicator();
      } else {
        this.flashWrongIndicator();
      }
    }
    if((card_no < (total_cards - 1)) || (config.quiz_type === "scoring" && card_no < total_cards)) {
      if(this.state.is_mobile) {
        // document.querySelector("#help_text").style.display = "block";
      } else {
        document.querySelector("#next").style.display = "block";
      }
    } else {
      // document.querySelector("#reset").style.display = "block";
    }

    if(!(config.quiz_type === "scoring" && config.flip_card === "no")) {
      back_div = parent.querySelector(".back");
      back_div.style.display = "block";

      if(config.quiz_type === "scoring") {
        setTimeout(function() {
          q_card.classList.add("clicked");
          if(option.right_or_wrong === "right") {
            back_div.querySelector(".wrong-answer").style.display = "none";
            back_div.querySelector(".correct-answer").classList.remove("deselected");
            // back_div.querySelector('.correct-answer .option-text').innerHTML = option.option;
          } else {
            back_div.querySelector(".wrong-answer").style.display = "block";
            back_div.querySelector('.wrong-answer .option-text').innerHTML = option.option;
            back_div.querySelector(".correct-answer").classList.add("deselected");
            // for(let i = 0; i < q_obj.options.length; i++) {
            //  if(q_obj.options[i].right_or_wrong === "right") {
            //    back_div.querySelector('.correct-answer .option-text').innerHTML = q_obj.options[i].option;
            //  }
            // }
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

        // addTouchEvents(front_div, config, total_questions);

        for(let j = 0; j < all_options.length; j++) {
          // all_options[j].style.pointerEvents = "none";
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


    // let q_card = e.target.closest(".question-card"),
    //   parent = e.target.closest(".content"),
    //   back_div,
    //   card_data = this.state.card_data[+q_card.getAttribute('data-order')],
    //   option = card_data.options[+e.target.getAttribute('data-option-id')];

    // back_div = parent.querySelector(".back");

    // q_card.classList.add("clicked");

    // parent.querySelector(".front").style.display = "none";
    // document.querySelector("#next").style.display = "block";

    // back_div.style.display = "block";
    // back_div.querySelector('.correct-answer').innerHTML = option.option;

    // if(option.answer_description) {
    //   back_div.querySelector(".answer").style.display = "block";
    //   back_div.querySelector(".answer").innerHTML = "";
    //   back_div.querySelector(".answer").appendChild(document.createTextNode(option.answer_description));
    // } else {
    //   back_div.querySelector(".answer").style.display = "none";
    // }

    // if(option.gif_image) {
    //   back_div.querySelector(".gif-div").style.display = "block";
    //   back_div.querySelector(".gif").onload = function (e) {
    //     let img_client_rect = e.target.offsetWidth,
    //       img_container_client_rect = back_div.querySelector(".gif-div").offsetWidth,
    //       ideal_img_width = img_container_client_rect - 20;

    //     if(img_client_rect >= ideal_img_width) {
    //       e.target.style.width = ideal_img_width + "px";
    //     }
    //   };
    //   back_div.querySelector(".gif").setAttribute("src", option.gif_image);
    // } else {
    //   back_div.querySelector(".gif-div").style.display = "none";
    // }

    // if(option.fact) {
    //   back_div.querySelector(".fact").style.display = "block";
    //   back_div.querySelector(".fact").innerHTML = "";
    //   back_div.querySelector(".fact").appendChild(document.createTextNode(option.fact));
    // } else {
    //   back_div.querySelector(".fact").style.display = "none";
    // }
  }

  nextCard(e) {
    let q_card = document.querySelector(".question-card.active"),
      card_no = +q_card.getAttribute("data-card-no"),
      main_container_width = document.querySelector(".main-container").offsetWidth,
      back_div,
      total_cards = this.state.total_cards;

    e.target.style.display = "none";

    q_card.classList.remove("active");
    q_card.style.left = (main_container_width + 500) + "px";

    let next_card = document.querySelector(".question-card[data-card-no='" + (card_no + 1) + "']");
    if(next_card && card_no + 1 < total_cards - 1) {
      next_card.classList.add("active");
      // if(!(config.quiz_type === "scoring" && config.flip_card === "no")) {
        back_div = next_card.querySelector(".back");
        back_div.style.display = "none";
      // }
    }
    // else if(config.quiz_type === "scoring") {
    //   document.querySelector("#reset").style.display = "block";
    // }

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
    // if(config.quiz_type === "scoring") {
    //   let conclusion_card = document.querySelector(".conclusion-card"),
    //     position = total_cards - card_no - 1;
    //   conclusion_card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + (((total_cards) - position) * 24) + ", " + (position * 320 * -1) + ", " + (1 + 0.16 * position) + ")";
    // }
  }

  resetQuiz(e) {
    this.setState({
      right_counter: 0,
      score: 0
    });

    let q_card = document.querySelector(".question-card.active"),
      all_questions = document.querySelectorAll(".question-card:not([data-card-type='intro']):not([data-card-type='score'])"), // instead can do data-card-type='qa' but its not done as we can have cards in between the question card stack that we want users to revisit.
      total_cards = this.state.total_cards,
      total_questions = this.state.total_questions,
      config = this.state.configs,
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
      // question_element.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + ((total_cards - i) * 16) + ", " + (i * 320 * -1) + ", " + (1 + 0.08 * i) + ")";
      question_element.style.display = "block";
      front_element.style.display = "block";
      question_element.style.left = "50%";
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

    conclusion_card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, 0, ${(total_cards * 320 * -1)}, ${(1 + 0.08 * total_cards)})`;

    for(let i = 0; i < progress_bars.length; i++) {
      progress_bars[i].style.display = "block";
    }

    this.hideSlider();

    // if(config.quiz_type === "scoring") {
    //   right_counter = 0;
    //   if(config.timer === "yes") {
    //     score = 0;
    //     setTimeout(function() {
    //       setTimer(config.time_per_question || 30);
    //     }, 0);
    //   }
    // }
  }

  revisitAnswers(e) {
    this.showSlider();
    this.slideCallback(0);
  }

  slideCallback(value) {
    this.setState({sliderValue: value});
    let total_questions = this.state.total_questions,
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
        // q_card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + ((total_questions - order_no) * 16) + ", " + (i * 320 * -1) + ", " + (1 + 0.08 * order_no) + ")";
        q_card.style.display = "block";
        q_card.style.left = "50%";
        q_card.style.top = "0px";
        // if((i - value) < 3) {
        //   setTimeout(function() {
        //     q_card.style.opacity = 1;
        //   }, 300);
        // } else {
        //   setTimeout(function() {
        //     q_card.style.opacity = 0;
        //   }, 300);
        // }
      }
    }
    conclusion_card.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${(value * 16)}, ${(total_questions * 320 * -1)}, ${(1 + 0.08 * (total_questions - value))})`
    // conclusion_card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + (value * 16) + ", " + (total_questions * 320 * -1) + ", " + (1 + 0.08 * (total_questions - value)) + ")";
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
      config = this.state.configs,
      total_cards = this.state.total_cards,
      back_div;

    if(next_card && card_no + 1 < total_cards - 1) {
      next_card.classList.add("active");
      if(!(config.quiz_type === "scoring" && config.flip_card === "no")) {
        back_div = next_card.querySelector(".back");
        back_div.style.display = "none";
      }
      if(config.quiz_type === "scoring" && config.timer === "yes") {
        // setTimeout(function() {
        //   setTimer(config.time_per_question || 30);
        // }, 0);
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

    // if(config.quiz_type === "scoring") {
      // let conclusion_card = document.querySelector(".conclusion-card"),
      //   position = total_cards - card_no - 1;
      // conclusion_card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + (((total_cards) - position) * 16) + ", " + (position * 320 * -1) + ", " + (1 + 0.08 * position) + ")";
      // if((total_cards - card_no) < 4) {
      //   conclusion_card.style.opacity = 1;
      // }
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

  resetSlider(total_questions) {
    let slider = document.querySelector(".card-slider");
    slider.setAttribute("value", total_questions);
    slider.style.background = "linear-gradient(to right, #D6EDFF 0%, #168BE5 100%, #EEE 100%)";
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

  renderMainContainerContent(cards) {
    if (this.state.fetching_questions) {
      return (
        <div className='main-container'>
          <div className="loading-card" style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', opacity:1, zIndex: 500}}>
            <span className="loading-text" style={{position:'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center'}}>
              Fetching Questions ...
            </span>
          </div>
        </div>
      )
    } else {
      return (
        <div className='main-container'>
          <div id="correct_indicator" className="correct-wrong-indicator correct-background">
            <div className="tick-background">
              <span className="correct-tick">&#10004;</span>
            </div>
            <div className="correct-wrong-text">Correct</div>
          </div>
          <div id="wrong_indicator" className="correct-wrong-indicator wrong-background">
            <div className="tick-background wrong-tick">
              <span>&#10007;</span>
            </div>
            <div className="correct-wrong-text wrong">Wrong</div>
          </div>
          <div id="card_stack" className="card-stack">
            {cards}
            <div id="next" className="next" onClick={(e) => this.nextCard(e)}>{this.state.language_texts.next}</div>
            <div id="reset" className="reset" >{this.state.language_texts.restart}</div>
            {
              window.innerWidth <= 500 ? <div className='help-text' id="help_text">{this.state.language_texts.swipe}</div> : undefined
            }
          </div>
          <input className="card-slider" name="card_slider" type="range" step="1" min="0" max={this.state.total_questions} value={this.state.sliderValue} onInput={((e) => { this.slideCallback(e.target.value); })}/>
        </div>
      )
    }
  }

  render() {
    let styles = {},
      x = this.state.card_meta_data.length * 16,
      y = 0,
      z = 1,
      cards,
      question_card_count = 0;


    cards = this.state.card_meta_data.map((card, i) => {
      const style = {},
        events = {};

      style.zIndex = this.state.card_meta_data.length - i;
      style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${x}, ${y}, ${z})`;

      if(i < 3) {
        style.opacity = 1;
      } else {
        style.opacity = 0;
      }

      x = x - 16;
      y = y - 320;
      z = z + 0.08;

      switch (card.card_type) {
        case 'intro':
          events.startQuiz = ((e) => this.startQuiz(e));
          break;
        case 'qa':
          //Updating the count of question cards.
          question_card_count += 1;
          events.optionClick = ((e) => this.optionClicked(e));
          events.nextCard = ((e) => this.nextCard(e));
          if (this.state.is_mobile) {
            events.onTouchStart = ((e) => Touch.swipeStart(e));
            events.onTouchMove = ((e) => Touch.swipeMove(e));
            events.onTouchEnd = ((e) => this.touchEndHandler(e));
          }
          break;
        case 'score':
          events.resetQuiz = ((e) => this.resetQuiz(e));
          events.revisitAnswers = ((e) => this.revisitAnswers(e));
          break;
      }

      return (
        <Card
          key={card.id}
          cardId={card.id}
          cardType={card.card_type}
          cardStyle={style}
          cardData={this.state.card_data[i]}
          cardEvents={events}
          languageTexts={this.state.language_texts}
          cardNo={i}
          cardConfigs = {this.state.configs}
          resultCardConfigs = {this.state.result_card_configs}
          questionNo={card.card_type === 'qa' ? this.formatNumber(question_card_count) : undefined}
          totalCards={this.formatNumber(this.state.total_cards)}
          totalQuestionCards={this.formatNumber(this.state.total_questions)}
          score={this.state.score}
          isMobile={this.state.is_mobile} />
      )
    });

    return this.renderMainContainerContent(cards)
  }
}

Container.defaultProps = {
  containerURL: '/src/js/container.json'
}

export default Container;

