import React            from 'react';
import ReactDOM         from 'react-dom';
import axios            from 'axios';
import Utility          from './utility.js';
import Quiz             from './quiz.jsx';
import JSONSchemaForm   from '../../lib/js/react-jsonschema-form';

class EditQuiz extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      fetchingData: true,
      dataJSON: {
        data: {},
        mandatory_config: {}
      },
      schemaJSON: {},
      optionalConfigJSON: {},
      optionalConfigSchemaJSON: {},
      uiSchemaJSON: {},
      step: 1
    };
  }

  componentDidMount() {
    if (this.state.fetchingData) {
      axios.all([
        axios.get(this.props.dataURL),
        axios.get(this.props.schemaURL),
        axios.get(this.props.configURL),
        axios.get(this.props.configSchemaURL),
        axios.get(this.props.uiSchemaURL)
      ]).then(axios.spread((cardData, cardSchema, optionalConfig, optionalConfigSchema, uiSchema) => {
          let stateVar = {
            fetchingData: false,
            dataJSON: cardData.data,
            schemaJSON: cardSchema.data,
            optionalConfigJSON: optionalConfig.data,
            optionalConfigSchemaJSON: optionalConfigSchema.data,
            uiSchemaJSON: uiSchema.data,
          };

          stateVar.dataJSON.data.result_card_data = stateVar.dataJSON.data.result_card_data ?  this.processResultData(stateVar.dataJSON.data.result_card_data, stateVar.dataJSON.mandatory_config.quiz_type) : undefined;
          stateVar.totalQuestions = stateVar.dataJSON.data.questions.length;
          stateVar.totalCards = (stateVar.totalQuestions + 2);
          stateVar.languageTexts = this.getLanguageTexts(stateVar.dataJSON.mandatory_config.language);

          if (stateVar.dataJSON.mandatory_config.time_per_question) {
            stateVar.timePerQuestion = stateVar.dataJSON.mandatory_config.time_per_question;
            stateVar.timerCountValue = stateVar.dataJSON.mandatory_config.time_per_question;
          }

          this.setState(stateVar);
        }));
    }
  }

  processResultData(resultCardData, quizType) {
    let processedData = [];
    if(quizType === "scoring" && resultCardData[0].upper_limit_of_score_range) {
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

  getLanguageTexts(languageConfig) {
    let language = languageConfig ? languageConfig : "english",
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
      text_obj.next = text_obj.next;
      text_obj.restart = text_obj.restart;
      text_obj.swipe = text_obj.swipe;
    }

    return text_obj;
  }

  getSchemaJSON() {
    switch(this.state.step){
      case 1:
        return this.state.schemaJSON.properties.mandatory_config;
        break;
      case 2:
        return this.state.schemaJSON.properties.data.properties.basic_datapoints;
        break;
      case 3:
        return this.state.schemaJSON.properties.data.properties.questions;
        break;
      case 4:
        return this.state.schemaJSON.properties.data.properties.result_card_data;
        break;
      case 5:
        return this.state.optionalConfigSchemaJSON;
        break;
    }
  }

  getFormData() {
    switch(this.state.step) {
      case 1:
        return this.state.dataJSON.mandatory_config;
        break;
      case 2:
        return this.state.dataJSON.data.basic_datapoints;
        break;
      case 3:
        return this.state.dataJSON.data.questions;
        break;
      case 4:
        return this.state.dataJSON.data.result_card_data;
        break;
      case 5:
        return this.state.optionalConfig;
        break;
    }
  }

  getUISchemaJSON() {
    switch(this.state.step) {
      case 1:
        return this.state.uiSchemaJSON.mandatory_config;
        break;
      case 3:
      console.log(this.state.uiSchemaJSON.data.questions);
        return this.state.uiSchemaJSON.data.questions;
        break;
      default:
        return {};
        break;
    }
  }

  showLinkText() {
    switch(this.state.step) {
      case 1:
        return '';
        break;
      case 2:
        return '< Back';
        break;
      case 3:
        return '< Back';
        break;
      case 4:
        return '< Back';
        break;
      case 5:
        return '< Back';
        break;
    }
  }

  showButtonText() {
    switch(this.state.step) {
      case 1:
        return 'Next';
        break;
      case 2:
        return 'Next';
        break;
      case 3:
        return 'Next';
        break;
      case 4:
        return 'Next';
        break;
      case 5:
        return 'Publish';
        break;
    }
  }

  onPrevHandler() {
    this.setState((prevStep, prop) => {
      return {
        step: --prevStep.step
      }
    });
  }

  onChangeHandler({formData}) {
    switch (this.state.step) {
      case 1:
        this.setState((prevStep, prop) => {
          let dataJSON = prevStep.dataJSON;
          dataJSON.mandatory_config = formData
          return {
            dataJSON: dataJSON
          }
        });
        break;
      case 2:
        this.setState((prevStep, prop) => {
          let dataJSON = prevStep.dataJSON;
          dataJSON.data.basic_datapoints = formData;
          return {
            dataJSON: dataJSON
          }
        });
        break;
      case 3:
        this.setState((prevStep, prop) => {
          let dataJSON = prevStep.dataJSON;
          dataJSON.data.questions = formData;
          return {
            dataJSON: dataJSON,
            totalQuestions: dataJSON.data.questions.length
          }
        });
        break;
      case 4:
        this.setState((prevStep, prop) => {
          let dataJSON = prevStep.dataJSON;
          dataJSON.data.result_card_data = formData;
          return {
            dataJSON: dataJSON
          }
        });
        break;
      case 5:
        // this.setState((prevStep, prop) => {
        //   let dataJSON = prevStep.dataJSON;
        //   dataJSON.data.questions = formData;
        //   return {
        //     dataJSON: dataJSON
        //   }
        // });
        break;
    }
  }

  onSubmitHandler({formData}) {
    switch(this.state.step) {
      case 1:
        this.setState({
          step: 2
        });
        break;
      case 2:
        this.setState({
          step: 3
        });
        break;
      case 3:
        this.setState({
          step: 4
        });
        break;
      case 4:
        this.setState({
          step: 5
        });
        break;
      case 5:
        alert("The card is published");
        break;
    }
  }

  getReferenceFormData() {
    switch(this.state.step) {
      case 1:
        return JSON.parse(JSON.stringify(this.state.dataJSON.mandatory_config));
        break;
      case 2:
        return JSON.parse(JSON.stringify(this.state.dataJSON.mandatory_config));
        break;
      case 3:
        return JSON.parse(JSON.stringify(this.state.dataJSON.mandatory_config));
        break;
      case 4:
        return JSON.parse(JSON.stringify(this.state.dataJSON.mandatory_config));
        break;
      case 5:
        return JSON.parse(JSON.stringify(this.state.dataJSON.mandatory_config));
        break;
    }
  }

  render() {
    if (this.state.fetchingData) {
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
      console.log(<JSONSchemaForm
              schema = {this.getSchemaJSON()}
              formData = {this.getFormData()}
              uiSchema={this.getUISchemaJSON()}
              onSubmit = {((e) => this.onSubmitHandler(e))}
              onChange = {((e) => this.onChangeHandler(e))}
            />, this.getSchemaJSON(), this.getFormData(), this.getUISchemaJSON())
      return (
        <div className="col-sm-12">
          <div className = "col-sm-5">
            <JSONSchemaForm schema = {this.getSchemaJSON()}
              onSubmit = {((e) => this.onSubmitHandler(e))}
              onChange = {((e) => this.onChangeHandler(e))}
              referenceFormData={this.getReferenceFormData()}
              formData = {this.getFormData()}
              uiSchema={this.getUISchemaJSON()}
            >
              <a onClick={((e) => this.onPrevHandler(e))}> {this.showLinkText()} </a>
              <button type="submit" className="btn btn-info">
                {this.showButtonText()}
              </button>
            </JSONSchemaForm>
          </div>
          <div className = "col-sm-7">
          <Quiz
              mode='laptop'
              dataJSON={this.state.dataJSON}
              schemaJSON={this.state.schemaJSON}
              optionalConfigJSON={this.state.optionalConfigJSON}
              optionalConfigSchemaJSON={this.state.optionalConfigSchemaJSON}
              totalQuestions={this.state.totalQuestions}
              totalCards={this.state.totalCards}
              languageTexts={this.state.languageTexts}
              timePerQuestion={this.state.timePerQuestion}
              timerCountValue={this.state.timerCountValue}
            />
          </div>
        </div>
      )
    }
  }



}

export default EditQuiz;