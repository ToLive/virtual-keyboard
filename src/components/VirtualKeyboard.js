import Key from '../components/Key.js';
import keyboardEn from '../data/keyboardEn.js';

export default class VirtualKeyboard {
  constructor(element) {
    this.element = element;
  }

  init() {
    keyboardEn.map((row) => {
      const rowContainer = document.createElement('div');
      rowContainer.classList.add('row');
      this.element.appendChild(rowContainer);

      row.map((item) => {
        rowContainer.appendChild(Key(item.type, item.symbols));
      })
    });
  }
}
