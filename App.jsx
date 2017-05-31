import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

let containerTemplate;

export class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      data: []
    }
  }

  componentDidMount() {
    var that = this;
    this.serverRequest = 
      axios
        .get("cards.json")
        .then(function (result) {    
          console.log(result, "result")
          // that.createCards(result.data.cards)
          that.setState({
            data: result.data.cards
          });
        })
  }

  // createCards(data) {
  //   let card,
  //     x = data.length * 24,
  //     y = 0,
  //     z = 1;
  //   for (let i = 0; i < data.length; i++){
  //     card = document.createElement("div")
  //     card.id = data[i].id
  //     card.className = 'card-div' 
  //     document.getElementById("root-div").appendChild(card) 
  //     document.getElementById(card.id).style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0," + x + "," + y + "," + z + ")"
  //     document.getElementById(card.id).style.zIndex = data.length - i;
  //     // ReactDOM.render(<App />, document.getElementById(card.id));
  //     x = x - 24;
  //     y = y - 320;
  //     z = z + 0.16;
  //   }   
  // }

  render() {
    let i = 0,
      x = this.state.data.length * 24,
      y = 0,
      z = 1;
    let cards = this.state.data.map((card) => {
      let styles = {
        zIndex : this.state.data.length - i,
        transform : "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0," + x + "," + y + "," + z + ")"
      };
      i++;
      x = x - 24;
      y = y - 320;
      z = z + 0.16;
      return(
        <div key = {card.id} className = "card-div" style = {styles} ></div>
      )
    })
    return <div>{cards}</div>
  }
}

ReactDOM.render(<App />, document.getElementById("root-div"));

// export default App;
