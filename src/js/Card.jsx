import React              from 'react';
import ReactDOM           from 'react-dom';
import RenderQuestionCard from '../cards/question-cards.jsx'

class Card extends React.Component {

  render() {
    return (
      <div
        className={this.props.cardNo === 0 ? 'question-card active' : 'question-card'}
        data-order={this.props.cardNo}
        style={this.props.cardStyle}
        data-card-type={this.props.cardType}
        data-isNavigable='0'
      >
        { RenderQuestionCard(this.props, this.state) }
      </div>
    )
  }

}

export default Card