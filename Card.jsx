import React from 'react';
import ReactDOM from 'react-dom';

class Card extends React.Component {

  render() {
    const module = require(`./cards/${this.props.cardId}.jsx`)
    return (
      <div  id='question_card' className={this.props.cardOrderId === 0 ? 'question-card active' : 'question-card'} data-order={this.props.cardOrderId} style={this.props.cardStyle} >
        { module.render(this.props, this.state) }
      </div>
    )
  }

}

export default Card