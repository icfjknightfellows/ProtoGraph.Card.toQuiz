import React from 'react';
import ReactDOM from 'react-dom';
import EditQuiz from './src/js/edit_quiz.jsx';

window.ProtoGraph = window.ProtoGraph || {};
window.ProtoGraph.Card = window.ProtoGraph.Card || {};

if (!NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

ProtoGraph.Card.toQuiz.prototype.getData = function () {
  return this.containerInstance.exportData();
}

ProtoGraph.Card.toQuiz.prototype.renderSEO = function (data) {
  this.renderMode = 'SEO';
  return this.containerInstance.renderSEO();
}

ProtoGraph.Card.toQuiz.prototype.renderEdit = function (onPublishCallback) {
  this.mode = 'edit';
  ReactDOM.render(
    <EditQuiz
      dataURL={this.options.data_url}
      schemaURL={this.options.schema_url}
      configURL={this.options.configuration_url}
      configSchemaURL={this.options.configuration_schema_url}
      uiSchemaURL={this.options.ui_schema_url}
      siteConfigURL={this.options.site_config_url}
      baseURL={this.options.base_url}
      mode={this.mode}
      onPublishCallback={onPublishCallback}
      ref={(e) => {
        this.containerInstance = this.containerInstance || e;
      }}/>,
    this.options.selector);
}