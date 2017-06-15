import React              from 'react';
import ReactDOM           from 'react-dom';
import RenderQuestionCard from '../cards/question-cards.jsx'

class Card extends React.Component {

  render() {
    return (
      <div
        id='question_card'
        className={this.props.cardNo === 0 ? 'question-card active' : 'question-card'}
        data-card-no={this.props.cardNo}
        style={this.props.cardStyle}
        data-card-type={this.props.cardType}>
        { RenderQuestionCard(this.props, this.state) }
      </div>
    )
  }

}

export default Card