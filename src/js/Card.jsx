import React from 'react';
import ReactDOM from 'react-dom';

class Card extends React.Component {

  render() {
    const module = require(`../../cards/${this.props.cardId}.jsx`)
    return (
      <div
        id='question_card'
        className={this.props.cardNo === 0 ? 'question-card active' : 'question-card'}
        data-card-no={this.props.cardNo}
        data-question-no={this.props.questionNo ? +this.props.questionNo : undefined }
        style={this.props.cardStyle}
        data-card-type={this.props.cardType}>
        { module.render(this.props, this.state) }
      </div>
    )
  }

}

export default Card