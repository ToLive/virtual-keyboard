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
            Enter: 'Enter',
            ShiftRight: 'ShiftRight',
            ShiftLeft: 'ShiftLeft',
            Space: 'Space',

            /* ArrowLeft: 'ArrowLeft',
            ArrowRight: 'ArrowRight',
            ArrowUp: 'ArrowUp',
            ArrowDown: 'ArrowDown', */
        };

        this.metaKeyState = {
            shift: false,
        };
    }

    modifyTextAtCursor(newText, action) {
        function getSelectionPos(element) {
            const [start, end] = [element.selectionStart, element.selectionEnd];

            return [start, end];
        }

        const [start, end] = getSelectionPos(this.textbox);

        if (!this.actions[action] || action === this.actions.Insert) {
            this.textbox.setRangeText(newText, start, end, 'end');

            return;
        }

        if (action === this.actions.Backspace) {
            this.textbox.setRangeText('', start - 1, end);

            return;
        }

        if (action === this.actions.Delete) {
            this.textbox.setRangeText('', start, end + 1);

            return;
        }

        if (action === this.actions.Tab) {
            this.textbox.setRangeText('\t', start, end, 'end');

            return;
        }

        if (action === this.actions.Enter) {
            this.textbox.setRangeText('\n', start, end, 'end');

            return;
        }

        if (action === this.actions.Space) {
            this.textbox.setRangeText(' ', start, end, 'end');
        }

        /* if (action === this.actions.ArrowLeft) {
            this.textbox.setRangeText('', start - 1, end - 1, 'start');

            return;
        }

        if (action === this.actions.ArrowRight) {
            this.textbox.setRangeText('', start + 1, end + 1, 'start');

            return;
        }

        if (action === this.actions.ArrowDown) {
            getLineNumberAndColumnIndex(this.textbox);
            //this.textbox.setRangeText('', start + 1, end + 1, 'start');

            return;
        } */
    }

    keyAction(event, code, value) {
        if (
            code === this.actions.ShiftLeft ||
            code === this.actions.ShiftRight
        ) {
            if (
                !this.metaKeyState.shift &&
                ['keydown', 'mousedown'].includes(event.type)
            ) {
                this.metaKeyState.shift = true;

                this.plainKeys.forEach((key) => {
                    const keyCopy = key;
                    keyCopy.innerHTML = key.innerHTML.toUpperCase();
                });
            }

            if (
                this.metaKeyState.shift &&
                ['keyup', 'mouseup', 'mouseleave'].includes(event.type)
            ) {
                this.metaKeyState.shift = false;

                this.plainKeys.forEach((key) => {
                    const keyCopy = key;
                    keyCopy.innerHTML = key.innerHTML.toLowerCase();
                });
            }

            return;
        }

        if (['keydown', 'mousedown'].includes(event.type)) {
            this.modifyTextAtCursor(value, code);
        }
    }

    buildInputBox() {
        this.textboxContainer = document.createElement('div');
        this.textboxContainer.classList.add('textbox__container');

        this.textbox = document.createElement('textarea');
        this.textbox.cols = 110;
        this.textbox.wrap = 'hard';
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
                    this.textbox.focus();

                    const { code } = event.target.dataset;

                    const key = document.querySelector(`[data-code="${code}"]`);
                    const multiSymbol = this.metaKeyState.shift ? 0 : 1;
                    const value = key.dataset.multi
                        ? key.innerHTML.split('<br>')[multiSymbol]
                        : key.innerHTML;

                    key.classList.add('pressed');

                    this.keyAction(event, code, value);
                    this.textbox.focus();
                });

                mappedKey.addEventListener('mouseup', (event) => {
                    const { code } = event.target.dataset;

                    const key = document.querySelector(`[data-code="${code}"]`);
                    key.classList.remove('pressed');

                    this.keyAction(event, code, null);

                    this.textbox.focus();
                });

                mappedKey.addEventListener('mouseleave', (event) => {
                    const { code } = event.target.dataset;

                    const key = document.querySelector(`[data-code="${code}"]`);
                    key.classList.remove('pressed');

                    this.keyAction(event, code, null);

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
            const multiSymbol = this.metaKeyState.shift ? 0 : 1;
            const value = key.dataset.multi
                ? key.innerHTML.split('<br>')[multiSymbol]
                : key.innerHTML;

            key.classList.add('pressed');

            this.keyAction(event, code, value);
            this.textbox.focus();
        });

        window.addEventListener('keyup', (event) => {
            const { code: codeUp } = event;

            if (pressedKeys.includes(codeUp)) {
                pressedKeys = pressedKeys.filter((item) => item !== codeUp);

                const key = document.querySelector(`[data-code="${codeUp}"]`);
                key.classList.remove('pressed');

                this.keyAction(event, codeUp, null);
            }

            this.textbox.focus();
        });

        return keyboardDiv;
    }

    init() {
        this.rootContainer.appendChild(this.buildInputBox());
        this.rootContainer.appendChild(this.buildKeyboard());

        this.textbox.addEventListener('blur', () => {
            this.textbox.focus();
        });

        this.plainKeys = document.querySelectorAll("[data-code^='Key']");
        this.multiKeys = document.querySelectorAll("[data-multi='true']");
    }
}
