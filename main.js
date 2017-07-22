import React from 'react';
import ReactDOM from 'react-dom';
import Quiz from './src/js/quiz.jsx';

window.ProtoGraph = window.ProtoGraph || {};
window.ProtoGraph.Card = window.ProtoGraph.Card || {};

if (!NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

ProtoGraph.Card.toQuiz = function () {
  this.cardType = 'QuizApp';
}

ProtoGraph.Card.toQuiz.prototype.init = function (options) {
  this.options = options;
}

ProtoGraph.Card.toQuiz.prototype.getData = function () {
  return this.containerInstance.exportData();
}

ProtoGraph.Card.toQuiz.prototype.renderLaptop = function () {
  this.mode = 'laptop';
  ReactDOM.render(
    <Quiz
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      configURL={this.options.configuration_url}
      configSchemaURL={this.options.configuration_schema_url}
      uiSchemaURL={this.options.ui_schema_url}
      baseURL={this.options.base_url}
      mode={this.mode}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
    this.options.selector);
}

ProtoGraph.Card.toQuiz.prototype.renderMobile = function () {
  this.mode = 'mobile';
  ReactDOM.render(
    <Quiz
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      configURL={this.options.configuration_url}
      configSchemaURL={this.options.configuration_schema_url}
      uiSchemaURL={this.options.ui_schema_url}
      baseURL={this.options.base_url}
      mode={this.mode}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
    this.options.selector);
}

ProtoGraph.Card.toQuiz.prototype.renderScreenshot = function () {
  this.mode = 'screenshot';
  ReactDOM.render(
    <Quiz
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      configURL={this.options.configuration_url}
      configSchemaURL={this.options.configuration_schema_url}
      uiSchemaURL={this.options.ui_schema_url}
      baseURL={this.options.base_url}
      mode={this.mode}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
    this.options.selector);
}