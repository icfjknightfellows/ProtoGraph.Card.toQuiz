import React            from 'react';
import ReactDOM         from 'react-dom';
import axios            from 'axios';
import Utility          from './utility.js';
import Quiz             from './quiz.jsx';
import JSONSchemaForm   from '../../lib/js/react-jsonschema-form';

class EditQuiz extends React.Component {

  constructor(props) {
    super(props);

    this.shouldQuizRender = true;

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
      resultCardData: {},
      step: 1,
      updatingQuiz: false,
      baseURL: this.props.baseURL
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
            resultCardData: cardData.data.data.result_card_data,
            uiSchemaJSON: uiSchema.data,
          };

          stateVar.dataJSON.data.result_card_data = stateVar.dataJSON.data.result_card_data && stateVar.dataJSON.data.result_card_data.length ?  this.processResultData(stateVar.dataJSON.data.result_card_data, stateVar.dataJSON.mandatory_config.quiz_type) : undefined;
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

  exportData() {
    let getDataObj = {
      dataJSON: JSON.parse(JSON.stringify(this.state.dataJSON)),
      optionalConfigJSON: this.state.optionalConfigJSON
    };
    getDataObj.dataJSON.data.result_card_data = this.state.resultCardData;
    getDataObj["name"] = getDataObj.dataJSON.data.basic_datapoints.quiz_title.substr(0,225); // Reduces the name to ensure the slug does not get too long
    return getDataObj;
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
        return this.state.resultCardData;
        break;
      case 5:
        return this.state.optionalConfigJSON;
        break;
    }
  }

  getUISchemaJSON() {
    switch(this.state.step) {
      case 1:
        return this.state.uiSchemaJSON.mandatory_config;
        break;
      case 2:
        return this.state.uiSchemaJSON.data.basic_datapoints;
        break;
      case 3:
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
      case 3:
      case 4:
      case 5:
        return '< Back';
        break;
    }
  }

  showButtonText() {
    switch(this.state.step) {
      case 1:
      case 2:
      case 3:
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

  // validateAndSetOptionsValues(questions) {
  //   questions.forEach((e, i) => {
  //     let options = e.options,
  //       isValid;

  //     isValid = options.reduce((boolean, current) => {
  //       return boolean || current.right_or_wrong;
  //     }, false);
  //     debugger;
  //     if (!isValid) {
  //       options[0].right_or_wrong = !options[0].right_or_wrong
  //     }
  //   });
  // }

  onChangeHandler({formData}) {
    switch (this.state.step) {
      case 1:
        this.setState((prevStep, prop) => {
          let dataJSON = prevStep.dataJSON;

          if (formData.quiz_type_form === 'scoring_and_timer') {
            formData.quiz_type = "scoring";
            formData.timer = true;
          } else {
            formData.quiz_type = formData.quiz_type_form;
          }

          dataJSON.mandatory_config = formData;
          return {
            updatingQuiz: true,
            dataJSON: dataJSON
          }
        });
        break;
      case 2:
        this.setState((prevStep, prop) => {
          let dataJSON = prevStep.dataJSON;
          dataJSON.data.basic_datapoints = formData;
          return {
            updatingQuiz: true,
            dataJSON: dataJSON
          }
        });
        break;
      case 3:
        this.setState((prevStep, prop) => {
          let dataJSON = prevStep.dataJSON;
          // if (this.state.dataJSON.mandatory_config.quiz_type === "scoring") {
          //   this.validateAndSetOptionsValues(formData);
          //   debugger;
          // }
          dataJSON.data.questions = formData;
          return {
            updatingQuiz: true,
            dataJSON: dataJSON,
            totalQuestions: dataJSON.data.questions.length
          }
        });
        break;
      case 4:
        this.setState((prevStep, prop) => {
          let resultCardData = formData,
            dataJSON = prevStep.dataJSON;
          dataJSON.data.result_card_data = resultCardData && resultCardData.length ? this.processResultData(resultCardData, dataJSON.mandatory_config.quiz_type) : [];
          return {
            updatingQuiz: true,
            dataJSON: dataJSON,
            resultCardData: resultCardData
          }
        });
        break;
      case 5:
        this.setState((prevStep, prop) => {
          return {
            optionalConfigJSON: formData
          }
        });
        break;
    }
  }

  onSubmitHandler({formData}) {
    switch(this.state.step) {
      case 1:
      case 2:
      case 3:
      case 4:
        this.setState((prevStep, prop) => {
          return {
            step: prevStep.step + 1
          }
        });
        break;
      case 5:
        if (typeof this.props.onPublishCallback === "function") {
          this.setState({ publishing: true });
          let publishCallback = this.props.onPublishCallback();
          publishCallback.then((message) => {
            this.setState({ publishing: false });
          });
        }
        break;
    }
  }

  getReferenceFormData() {
    return JSON.parse(JSON.stringify(this.state.dataJSON.mandatory_config));
  }

  componentWillUpdate(prevProps, prevState) {
    if (document.getElementById('protograph_embed_editQuiz') && prevState.updatingQuiz) {
      // ReactDOM.unmountComponentAtNode(document.getElementById('protograph_embed_editQuiz'));
      this.shouldQuizRender = false;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (document.getElementById('protograph_embed_editQuiz') && this.state.updatingQuiz) {
      this.shouldQuizRender = true;
      this.setState({ updatingQuiz: false });
    }
  }

  renderQuiz() {
    if (this.shouldQuizRender) {
      return <Quiz
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
        baseURL={this.state.baseURL}
      />
    } else {
      return <div />
    }
  }

  setScrollClass() {
    switch(this.state.step) {
      case 3:
      case 4:
        return 'protograph-scroll-form'
        break;
      default:
        return ''
        break;
    }
  }

  render(e) {
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
      return (
        <div className="proto-container">
          <div className="ui grid form-layout">
            <div className="row">
              <div className={`four wide column proto-card-form ${this.setScrollClass()}`}>
                <div>
                  <div className="section-title-text">Fill the form</div>
                  <div className="ui label proto-pull-right">
                    ToQuiz
                  </div>
                </div>
                <br />
                <JSONSchemaForm
                  schema = {this.getSchemaJSON()}
                  onSubmit = {((e) => this.onSubmitHandler(e))}
                  onChange = {((e) => this.onChangeHandler(e))}
                  referenceFormData={this.getReferenceFormData()}
                  formData = {this.getFormData()}
                  uiSchema={this.getUISchemaJSON()}
                >
                  <br />
                  <a
                    onClick={((e) => this.onPrevHandler(e))}
                    className={`${this.state.publishing ? 'protograph-disable' : ''}`}
                  >
                    {this.showLinkText()}
                  </a>
                  <button
                    type="submit"
                    className={`${this.state.publishing ? 'ui primary loading disabled button' : ''} default-button protograph-primary-button`}
                  >
                    { this.showButtonText() }
                  </button>
                </JSONSchemaForm>
              </div>
              <div id="protograph_embed_editQuiz" className="twelve wide column proto-card-preview proto-share-card-div">
                { this.renderQuiz() }
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
}

export default EditQuiz;