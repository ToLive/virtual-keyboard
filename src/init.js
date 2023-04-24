// @ts-check

import VirtualKeyboard from './components/VirtualKeyboard.js';

export default () => {
  const body = document.body;
  const root = document.createElement('div');
  body.appendChild(root);

  const obj = new VirtualKeyboard(root);
  obj.init();
};
