import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
// import Card from './Card.jsx';

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
          // card_data: card.data.root.row,
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


  render() {
    let styles = {};
    if (this.state.device_data !== undefined){
      let dimension = this.getScreenSize();
      console.log(dimension.width, "width")
      if (dimension.width <= 500){ // mobile
        styles.base = {
          width : this.state.device_data.mobile.width,
          height : this.state.device_data.mobile.height         
        }
      } else if (dimension.width <= 1024){ //ipad
        styles.base = {
          width : this.state.device_data.tablet.width,
          height : this.state.device_data.tablet.height
        }
      } else { // desktop or default
        styles.base = {
          width : this.state.device_data.desktop.width,
          height : this.state.device_data.desktop.height         
        }
      }
    }
    let i = 0,
      x = this.state.card_meta_data.length * 24,
      y = 0,
      z = 1;
    let cards = this.state.card_meta_data.map((card) => {
      console.log(this.state.card_meta_data.length - i, "zindex")
      styles.custom = {
        zIndex : this.state.card_meta_data.length - i,
        transform : "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.0005, 0," + x + "," + y + "," + z + ")"
      }
      i++;
      x = x - 24;
      y = y - 320;
      z = z + 0.16;
      console.log(styles, "styles")
      // return(
      //   <div key = {card.id} className = "card-div" style = {{...styles.base,...styles.custom}} ></div>
      // )
    })
    return <div>{cards}</div>
  }
}

Container.defaultProps = {
  containerURL: './container.json'
}

export default Container;

