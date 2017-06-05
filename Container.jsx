import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Card from './Card.jsx';
import Scss from './container.scss'

export class Container extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      config: {},
      card_meta_data: [],
      card_data: [],
      device_data: undefined,
      total_questions: 0,
      card_height: 300,
      language_texts: {}
    };
  }

  componentDidMount() {
    axios.all([axios.get(this.props.containerURL), axios.get(this.props.dataURL)])
      .then(axios.spread((cont, card) => {

        this.setState({
          config: cont.data.configurations,
          card_meta_data: cont.data.cards,
          card_data: card.data.root.row,
          device_data : cont.data.platforms,
          total_questions: cont.data.cards.reduce((prev, curr) => {
            console.log(prev, curr)
            if (curr.card_type === 'qa') {
              return prev + 1;
            } else {
              return prev
            }
          }, 0),
          language_texts: this.getLanguageTexts(cont.data.configurations)
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

  getCardHeight(config, card_height, questions, total_questions) {
    let max_height = card_height,
      intro_header_bcr = document.querySelector(".intro-header").offsetHeight,
      intro_desc_bcr = document.querySelector(".intro-description").offsetHeight,
      intro_button_bcr = document.querySelector(".intro-button").offsetHeight,
      intro_height = (intro_header_bcr + intro_desc_bcr + intro_button_bcr + 50);

    if(intro_height > max_height) {
      max_height = intro_height;
    }

    // if(!(config.quiz_type === "scoring" && config.flip_card === "no")) {
    //   let max_back = document.querySelector(".max-content"),
    //     b_title = max_back.querySelector(".title").offsetHeight,
    //     b_ans = max_back.querySelector(".correct-answer").offsetHeight,
    //     b_gif = max_back.querySelector(".gif-div").offsetHeight,
    //     b_desc = max_back.querySelector(".answer").offsetHeight,
    //     b_fact = max_back.querySelector(".fact").offsetHeight,
    //     b_num = max_back.querySelector(".question-number").offsetHeight,
    //     back_height = b_title + Math.max(b_ans, 100) + b_desc + b_fact + b_num + 25;

    //   if(back_height > max_height) {
    //     max_height = back_height;
    //   }
    // }

    for(let i = 0; i < questions.length; i++) {
      let q_title = questions[i].querySelector(".title").offsetHeight,
        q_options = questions[i].querySelectorAll(".option-div"),
        q_num = questions[i].querySelector(".question-number").offsetHeight,
        q_que = questions[i].querySelector(".question").offsetHeight,
        q_height,
        order_id = +questions[i].getAttribute("data-order");

      q_height = q_title + q_que + q_num + 45;

      for(let j = 0; j < q_options.length; j++) {
        q_height += (q_options[j].offsetHeight + 15);
      }

      if(q_height > max_height) {
        max_height = q_height;
      }
      questions[i].style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + ((total_questions - order_id) * 24) + ", " + ((order_id + 1) * 320 * -1) + ", " + (1 + 0.16 * (order_id + 1)) + ")";
    }

    if(max_height > card_height) {
      card_height = max_height;
    }
    return card_height;
  }

  startQuiz(e) {
    let q_card = document.querySelector(".question-card.active"),
      order_id = +q_card.getAttribute("data-order"),
      main_container_width = document.querySelector(".main-container").offsetWidth,
      back_div,
      total_questions = 10;

    e.target.style.display = "none";

    q_card.classList.remove("active");
    q_card.style.left = (main_container_width + 500) + "px";

    let next_card = document.querySelector(".question-card[data-order='" + (order_id + 1) + "']");
    if(next_card) {
      next_card.classList.add("active");
      // if(!(config.quiz_type === "scoring" && config.flip_card === "no")) {
      //   back_div = next_card.querySelector(".back");
      //   back_div.style.display = "none";
      // }
    }
    //  else if(config.quiz_type === "scoring") {
    //   document.querySelector("#reset").style.display = "block";
    // }

    for(let i = (order_id + 1); i < total_questions; i++) {
      let card = document.querySelector(".question-card[data-order='" + i + "']"),
        position = (card.getAttribute("data-order") - order_id - 1);
      card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + (((total_questions) - position) * 24) + ", " + (position * 320 * -1) + ", " + (1 + 0.16 * position) + ")";
    }
    // if(config.quiz_type === "scoring") {
    //   let conclusion_card = document.querySelector(".conclusion-card"),
    //     position = total_questions - order_id - 1;
    //   conclusion_card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + (((total_questions) - position) * 24) + ", " + (position * 320 * -1) + ", " + (1 + 0.16 * position) + ")";
    // }
  }

  optionClicked(e) {
    console.log(e, this, "Option Clicked");
    let q_card = e.target.closest(".question-card"),
      parent = e.target.closest(".content"),
      back_div,
      card_data = this.state.card_data[+q_card.getAttribute('data-order')],
      option = card_data.options[+e.target.getAttribute('data-option-id')];

    back_div = parent.querySelector(".back");

    q_card.classList.add("clicked");

    parent.querySelector(".front").style.display = "none";
    document.querySelector("#next").style.display = "block";

    back_div.style.display = "block";
    back_div.querySelector('.correct-answer').innerHTML = option.option;

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
  }

  nextCard(e) {
    console.log(e, this, "nextCard Clicked");
    let q_card = document.querySelector(".question-card.active"),
      order_id = +q_card.getAttribute("data-order"),
      main_container_width = document.querySelector(".main-container").offsetWidth,
      back_div,
      total_questions = 10;

    e.target.style.display = "none";

    q_card.classList.remove("active");
    q_card.style.left = (main_container_width + 500) + "px";

    let next_card = document.querySelector(".question-card[data-order='" + (order_id + 1) + "']");
    if(next_card) {
      next_card.classList.add("active");
      // if(!(config.quiz_type === "scoring" && config.flip_card === "no")) {
        back_div = next_card.querySelector(".back");
        back_div.style.display = "none";
      // }
    }
    // else if(config.quiz_type === "scoring") {
    //   document.querySelector("#reset").style.display = "block";
    // }

    for(let i = (order_id + 1); i < total_questions; i++) {
      let card = document.querySelector(".question-card[data-order='" + i + "']"),
        position = (card.getAttribute("data-order") - order_id - 1);
      card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + (((total_questions) - position) * 24) + ", " + (position * 320 * -1) + ", " + (1 + 0.16 * position) + ")";
    }
    // if(config.quiz_type === "scoring") {
    //   let conclusion_card = document.querySelector(".conclusion-card"),
    //     position = total_questions - order_id - 1;
    //   conclusion_card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + (((total_questions) - position) * 24) + ", " + (position * 320 * -1) + ", " + (1 + 0.16 * position) + ")";
    // }
  }

  resetQuiz(e) {
    console.log(e, this, "resetQuiz Clicked");
  }

  render() {
    let styles = {},
      x = this.state.card_meta_data.length * 24,
      y = 0,
      z = 1,
      cards;

    // if (this.state.device_data !== undefined) {
    //   let dimension = this.getScreenSize();
    //   if (dimension.width <= 500) { // mobile
    //     styles.width = this.state.device_data.mobile.width;
    //     styles.height = this.state.device_data.mobile.height;
    //   } else if (dimension.width <= 1024) { //ipad
    //     styles.width = this.state.device_data.tablet.width;
    //     styles.height = this.state.device_data.tablet.height;
    //   } else { // desktop or default
    //     styles.width = this.state.device_data.desktop.width;
    //     styles.height = this.state.device_data.desktop.height;
    //   }
    // }

    cards = this.state.card_meta_data.map((card, i) => {
      const style = {};
      const events = {};
      // style.width = styles.width;
      // style.height = styles.height;
      style.zIndex = this.state.card_meta_data.length - i;
      style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, ${x}, ${y}, ${z})`;

      x = x - 24;
      y = y - 320;
      z = z + 0.16;

      switch (card.card_type) {
        case 'intro':
          events.startQuiz = ((e) => this.startQuiz(e));
          break;
        case 'qa':
          events.optionClick = ((e) => this.optionClicked(e));
          events.nextCard = ((e) => this.nextCard(e));
          break;
        case 'score':
          events.resetQuiz = ((e) => this.resetQuiz(e));
          break;
      }

      console.log(this.state.total_questions, this.formatNumber(this.state.total_questions));
      return (
        <Card
          key={card.id}
          cardOrderId={i}
          cardId={card.id}
          cardType={card.card_type}
          cardStyle={style}
          cardData={this.state.card_data[i]}
          cardEvents={events}
          languageTexts={this.state.language_texts}
          currentCardNumber={this.formatNumber(i)}
          totalQuestionCards={this.formatNumber(this.state.total_questions)} />
      )

    });

    return (
      <div className='main-container'>
        <div id="card_stack" className="card-stack">
          {cards}
          <div id="next" className="next" onClick={(e) => this.nextCard(e)}>{this.state.language_texts.next}</div>
          <div id="reset" className="reset" >{this.state.language_texts.restart}</div>
          <div id="credits" className="credits" >
            <a href="https://pykih.com/open-tools/quizjs" target="blank">Created by : ICFJ &amp; Pykih</a>
          </div>
        </div>
      </div>
    )
  }
}

Container.defaultProps = {
  containerURL: './container.json'
}

export default Container;

