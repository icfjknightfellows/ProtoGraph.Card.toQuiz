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
      errorOnFetchingData: undefined,
      step: 1,
      updatingQuiz: false,
      baseURL: this.props.baseURL,
      renderOverlay: false
    };
    this.formValidator = this.formValidator.bind(this);
    this.setDataJSON = this.setDataJSON.bind(this);
    this.transformErrors = this.transformErrors.bind(this);
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

          stateVar.totalQuestions = stateVar.dataJSON.data.questions.length;
          stateVar.totalCards = (stateVar.totalQuestions + 2);
          stateVar.languageTexts = this.getLanguageTexts(stateVar.dataJSON.mandatory_config.language);

          if (stateVar.dataJSON.mandatory_config.time_per_question) {
            stateVar.timePerQuestion = stateVar.dataJSON.mandatory_config.time_per_question;
            stateVar.timerCountValue = stateVar.dataJSON.mandatory_config.time_per_question;
          }

          this.setState(stateVar);
        }))
        .catch((error) => {
          this.setState({
            errorOnFetchingData: true
          })
        });
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

  getLanguageTexts(languageConfig) {
    let language = languageConfig ? languageConfig : "english",
      text_obj;

    switch(language.toLowerCase()) {
      case "hindi":
        text_obj = {
          question_title: "प्रश्न ",
          ans_title: "उत्तर",
          next: 'अगला प्रश्न',
          swipe: 'अगले प्रश्न के लिए ऊपर स्वाइप करें या यहां टैप करें',
          revisit_answers: 'उत्तर फिर से देखें',
          social_share: 'शेयर',
          go_back: 'वापस',
          starting_quiz: 'प्रश्नोत्तरी शुरू होता है',
          related_articles: 'संबंधित आलेख',
          timed_out: 'समय समााप्त!',
          correct: 'सही',
          wrong: 'गलत',
          message: 'धन्यवाद!',
          play_again: 'पुनः खेलें',
          oops: 'उफ़!',
          times_up: 'समय समाप्त',
          slider_text: 'प्रश्नों के बीच चलने के लिए स्लाइडर का उपयोग करें',
          fetching_questions: 'सवाल ला रहा है ...',
          font: "'Hindi', sans-serif"
        }
        break;
      default:
        text_obj = {
          question_title: "Question ",
          ans_title: "ANSWER",
          next: 'Next',
          swipe: 'Swipe up for next question or tap here',
          revisit_answers: 'Revisit Answers',
          social_share: 'Share',
          go_back: 'Go Back',
          starting_quiz: 'Starting your quiz in',
          related_articles: 'RELATED ARTICLES',
          timed_out: 'Timed out!',
          correct: 'Correct',
          wrong: 'Wrong',
          message: 'Thank you!',
          play_again: 'Play Again',
          oops: 'Oops!',
          times_up: "Times's up",
          slider_text: 'use slider to move between questions',
          fetching_questions: 'Fetching Questions ...',
          font: "'Helvetica Neue', sans-serif, aerial"
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

  transformErrors(errors) {
    switch(this.state.step) {
      case 2:
      case 3:
      case 4:
        return errors.map(error => {
          if (error.name === "pattern") {
            error.message = "Invalid image URL."
          }
          return error;
        });
        break;
      default:
        return errors;
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

  isOptionsValid(options) {
    var isValid = options.reduce((boolean, current) => {
        return boolean || current.right_or_wrong;
      }, false);

    return isValid;
  }

  validateOptions(questions, oldQuestions) {
    questions.forEach((e, i) => {
      let options = e.options,
        isValid;

      isValid = this.isOptionsValid(options);

      if (!isValid) {
        e.options = oldQuestions[i].options;
      }
    });
  }

  formValidator(formData, errors) {
    if (this.state.dataJSON.mandatory_config.quiz_type === "scoring") {
      switch(this.state.step) {
        case 3:
          formData.forEach((e, i) => {
            if (!this.isOptionsValid(e.options)) {
              // errors[i].options.addError("Atleast one option must be true.");
              errors[i].addError("Atleast one options must be true.");
            }
          });
          return errors;
        default:
          return errors;
      }
    }
    return errors;
  }

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
          dataJSON.data.questions = formData;
          return {
            renderOverlay: true,
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
      if (this.state.renderOverlay) {
        return (
          <div className="protograph-toQuiz-overlay-container">
            <div className={`protograph-toQuiz-overlay ${this.state.renderOverlay ? 'active' : ''}`} />
            <button className={`ui primary button protograph-toQuiz-rerender-quiz  ${this.state.renderOverlay ? 'active' : ''}`} onClick={this.setDataJSON}>Refresh Quiz</button>
          </div>
        );
      }

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

  setDataJSON() {
    this.setState({renderOverlay: false});
  }

  renderSEO() {
    const data = this.state.dataJSON.data;
    let intro_card = `<h3>${data.basic_datapoints.quiz_title}</h3><p>${data.basic_datapoints.introduction}</p>`
    let questions = data.questions.map((d,i) => {
      let options = d.options.map((opt, i) => {
        return `<p><p>${opt.option}</p></p>`
      })
      return `<h3>${d.question}</h3>${options}`
    })
    let seo_blockquote = '<blockquote>' + intro_card + questions.join() + '</blockquote>'
    return seo_blockquote;
  }

  render(e) {
    if (this.state.fetchingData) {
      return (
        <div className='quiz-container'>
          <div className="loading-card" style={{position: 'absolute', width: '100%', height: '100%', backgroundColor: 'white', opacity:1, zIndex: 500}}>
            <span className="loading-text" style={{position:'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}}>
              {
                !this.state.errorOnFetchingData ?
                  "Fetching Questions ..."
                :
                  <div className="ui basic message">
                    <div className="header">
                      Failed to load resources
                    </div>
                    <p>Try clearing your browser cache and refresh the page.</p>
                  </div>
              }
            </span>
          </div>
        </div>
      )
    } else {
      let style = {};
      if (this.state.renderOverlay) {
        style["display"] = 'block !important';
      }
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
                  validate={this.formValidator}
                  liveValidate={this.state.step === 3 && this.state.dataJSON.mandatory_config.quiz_type === "scoring" ? true : false}
                  ref={(e) => {this.Form = e;}}
                  transformErrors={this.transformErrors}
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
              <div id="protograph_embed_editQuiz" className={`twelve wide column proto-card-preview proto-share-card-div ${this.state.renderOverlay ? 'protograph-toQuiz-no-pointerEvents' : ''}`}>
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