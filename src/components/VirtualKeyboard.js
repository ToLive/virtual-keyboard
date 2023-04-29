import Key from './Key.js';
import keyboardEn from '../data/keyboardEn.js';

export default class VirtualKeyboard {
    constructor(element) {
        this.rootContainer = element;
        this.lineEnd = 0;
        this.actions = {
            Insert: 'Insert',
            Backspace: 'Backspace',
            Delete: 'Delete',
            Tab: 'Tab',
        };
    }

    modifyTextAtCursor(newText, action) {
        console.log(!this.actions[action]);
        if (!this.actions[action] || action === this.actions.Insert) {
            console.log('insert');
            const [start, end] = [
                this.textbox.selectionStart,
                this.textbox.selectionEnd,
            ];

            console.log(start, end);

            this.textbox.setRangeText(newText, start, end, 'end');
        }

        if (action === this.actions.Backspace) {
            const [start, end] = [
                this.textbox.selectionStart,
                this.textbox.selectionEnd,
            ];

            this.textbox.setRangeText('', start - 1, end);
        }

        if (action === this.actions.Delete) {
            const [start, end] = [
                this.textbox.selectionStart,
                this.textbox.selectionEnd,
            ];

            this.textbox.setRangeText('', start, end + 1);
        }
    }

    keyAction(code, value) {
        console.log(code, value);

        this.modifyTextAtCursor(value, code);
    }

    buildInputBox() {
        this.textboxContainer = document.createElement('div');
        this.textboxContainer.classList.add('textbox__container');

        this.textbox = document.createElement('textarea');
        this.textbox.classList.add('textbox__input');

        this.textboxContainer.appendChild(this.textbox);

        return this.textboxContainer;
    }

    buildKeyboard() {
        const keyboardDiv = document.createElement('div');
        keyboardDiv.classList.add('keyboard');

        keyboardEn.map((row) => {
            const rowContainer = document.createElement('div');

            rowContainer.classList.add('row');
            keyboardDiv.appendChild(rowContainer);

            return row.map((item) => {
                const mappedKey = Key(item.symbols, item.code, item.type);

                mappedKey.addEventListener('mousedown', (event) => {
                    console.log(event.target);
                    this.textbox.focus();

                    const { code } = event.target.dataset;
                    const value = event.target.innerHTML;

                    const key = document.querySelector(`[data-code="${code}"]`);
                    key.classList.add('pressed');

                    this.keyAction(code, value);
                    this.textbox.focus();
                });

                mappedKey.addEventListener('mouseup', (event) => {
                    const { code } = event.target.dataset;

                    const key = document.querySelector(`[data-code="${code}"]`);
                    key.classList.remove('pressed');

                    this.textbox.focus();
                });

                return rowContainer.appendChild(mappedKey);
            });
        });

        let pressedKeys = [];

        window.addEventListener('keydown', (event) => {
            this.textbox.focus();
            event.preventDefault();

            const { code } = event;
            pressedKeys.push(code);

            const key = document.querySelector(`[data-code="${code}"]`);
            key.classList.add('pressed');

            this.textbox.focus();
        });

        window.addEventListener('keyup', (event) => {
            const { code: codeUp } = event;

            if (pressedKeys.includes(codeUp)) {
                pressedKeys = pressedKeys.filter((item) => item !== codeUp);

                const key = document.querySelector(`[data-code="${codeUp}"]`);
                key.classList.remove('pressed');
            }

            this.textbox.focus();
        });

        return keyboardDiv;
    }

    init() {
        this.rootContainer.appendChild(this.buildInputBox());
        this.rootContainer.appendChild(this.buildKeyboard());

        this.textbox.addEventListener('blur', () => {
            console.log('focus');
            this.textbox.focus();
        });
    }
}
