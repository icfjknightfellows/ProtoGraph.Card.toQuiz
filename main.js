import React from 'react';
import ReactDOM from 'react-dom';
import Container from './src/js/Container.jsx';

export function HaikuContainer (options) {
  var root_element = options.selector.constructor === String ? document.querySelector(options.selector) : options.selector;
  ReactDOM.render( <Container dataURL={options.data_url} containerURL={options.container_data_url} />, root_element);
};
