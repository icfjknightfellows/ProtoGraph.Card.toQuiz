import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import Card from './Card.jsx';
import Scss from './container.scss'

export class Container extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      card_meta_data: [],
      card_data: [],
      device_data: undefined
    };
  }


  componentDidMount() {
    axios.all([axios.get(this.props.containerURL), axios.get(this.props.dataURL)])
      .then(axios.spread((cont, card) => {
        this.setState({
          card_meta_data: cont.data.cards,
          card_data: card.data.root.row,
          device_data : cont.data.platforms
        });
      }));
  }

  getScreenSize() {
    let w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      width = w.innerWidth || e.clientWidth || g.clientWidth,
      height = w.innerHeight|| e.clientHeight|| g.clientHeight;

    return {
      width: width,
      height: height
    };
  }

  // startQuiz(e) {
  //   console.log(e, this, "Start Quiz");
  //   let first_q_card = document.querySelector(".question-card[data-order='1']");
  //   let total_questions = 8;
  //   e.target.closest(".intro-card").style.left = (window.innerWidth + 500) + "px";

  //   // if(!(config.quiz_type === "scoring" && config.flip_card === "no")) {
  //   //   first_q_card.querySelector(".back").style.display = "none";
  //   // }
  //   first_q_card.classList.add("active");
  //   first_q_card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + ((total_questions) * 24) + ", 0, 1)";
  //   for(let i = 2; i < total_questions; i++) {
  //     let card = document.querySelector(".question-card[data-order='" + i + "']"),
  //       position = card.getAttribute("data-order");

  //     card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, " + (((total_questions) - position) * 24) + ", " + (position * 320 * -1) + ", " + (1 + 0.16 * position) + ")";
  //   }
  //   // if(config.quiz_type === "scoring") {
  //   //   let conclusion_card = document.querySelector(".conclusion-card");
  //   //   conclusion_card.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0, 0, " + (total_questions * 320 * -1) + ", " + (1 + 0.16 * total_questions) + ")";
  //   // }


  // }

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
      back_div;

    back_div = parent.querySelector(".back");

    q_card.classList.add("clicked");
    parent.querySelector(".front").style.display = "none";

    back_div.style.display = "block";
    //onClickOfOption
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

    if (this.state.device_data !== undefined) {
      let dimension = this.getScreenSize();
      if (dimension.width <= 500) { // mobile
        styles.width = this.state.device_data.mobile.width;
        styles.height = this.state.device_data.mobile.height;
      } else if (dimension.width <= 1024) { //ipad
        styles.width = this.state.device_data.tablet.width;
        styles.height = this.state.device_data.tablet.height;
      } else { // desktop or default
        styles.width = this.state.device_data.desktop.width;
        styles.height = this.state.device_data.desktop.height;
      }
    }

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

      return (
        <Card
          key={card.id}
          cardOrderId={i}
          cardId={card.id}
          cardType={card.card_type}
          cardStyle={style}
          cardData={this.state.card_data[i]}
          cardEvents={events} />
      )

    });

    return (
      <div className='main-container'>
        <div id="card_stack" className="card-stack">
          {cards}
        </div>
      </div>
    )
  }
}

Container.defaultProps = {
  containerURL: './container.json'
}

export default Container;

