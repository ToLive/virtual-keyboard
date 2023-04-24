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
        rowContainer.appendChild(Key(item.type, item.symbols, item.code));
      })
    });

    let pressedKeys = [];

    addEventListener('keydown', (event) => {
      event.preventDefault();

      const { code } = event;
      pressedKeys.push(code);

      const key = document.querySelector(`[data-code="${code}"]`);
      key.classList.add('pressed');
    });

    addEventListener('keyup', (event) => {
      const { code: codeUp } = event;

      if (pressedKeys.includes(codeUp)) {
        pressedKeys = pressedKeys.filter((item) => item !== codeUp);

        const key = document.querySelector(`[data-code="${codeUp}"]`);
        key.classList.remove('pressed');
      }
    })
  }
}
