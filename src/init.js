// @ts-check

import Example from './Example.js';

export default () => {
  const body = document.body;
  const root = document.createElement('div');
  body.appendChild(root);

  const obj = new Example(root);
  obj.init();
};
