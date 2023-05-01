import Key from './Key.js';
import keyboardEn from '../data/keyboardEn.js';
import keyboardRu from '../data/keyboardRu.js';

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
            AltRight: 'AltRight',
            AltLeft: 'AltLeft',
            MetaLeft: 'MetaLeft',
            CapsLock: 'CapsLock',
            ControlRight: 'ControlRight',
            ControlLeft: 'ControlLeft',
        };

        this.metaKeyState = {
            shift: false,
            capslock: false,
            alt: false,
        };
    }

    setLang(lang) {
        const allowedLang = ['ru', 'en'];

        if (!allowedLang.includes(lang)) {
            throw Error('Wrong language: ', lang);
        }

        if (this.getLang() && this.getLang() !== lang) {
            this.destroyKeyboard();

            this.rootContainer.appendChild(this.buildKeyboard(lang));
        }

        this.lang = lang;

        localStorage.setItem('lang', this.lang);
    }

    getLang() {
        return localStorage.getItem('lang', this.lang) || 'en';
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
            if (start > 0) {
                this.textbox.setRangeText('', start - 1, end);
            }

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

            return;
        }

        if (action === this.actions.MetaLeft) {
            // do nothing with WIN key
        }
    }

    keyAction(event, code, value) {
        const { AltLeft, AltRight, ShiftLeft, ShiftRight, CapsLock } =
            this.actions;
        const {
            alt: metaAlt,
            shift: metaShift,
            capslock: metaCaps,
        } = this.metaKeyState;
        const downEvents = ['keydown', 'mousedown'];
        const upEvents = ['keyup', 'mouseup', 'mouseleave'];

        // handle language change with alt key
        if (code === AltLeft || code === AltRight) {
            if (!metaAlt && downEvents.includes(event.type)) {
                this.metaKeyState.alt = true;

                if (metaShift) {
                    this.setLang(this.getLang() === 'en' ? 'ru' : 'en');
                }
            }

            if (metaAlt && upEvents.includes(event.type)) {
                this.metaKeyState.alt = false;
            }
        }

        // handle upper case keys with shift and language change
        if (code === ShiftLeft || code === ShiftRight) {
            if (!metaShift && downEvents.includes(event.type)) {
                this.metaKeyState.shift = true;

                if (metaAlt) {
                    this.setLang(this.getLang() === 'en' ? 'ru' : 'en');
                }

                this.plainKeys.forEach((key) => {
                    const keyCopy = key;
                    keyCopy.innerHTML = metaCaps
                        ? key.innerHTML.toLowerCase()
                        : key.innerHTML.toUpperCase();
                });
            }

            if (metaShift && upEvents.includes(event.type)) {
                this.metaKeyState.shift = false;

                this.plainKeys.forEach((key) => {
                    const keyCopy = key;
                    keyCopy.innerHTML = metaCaps
                        ? key.innerHTML.toUpperCase()
                        : key.innerHTML.toLowerCase();
                });
            }

            return;
        }

        if (code === CapsLock) {
            if (!metaCaps && downEvents.includes(event.type)) {
                this.metaKeyState.capslock = true;

                this.plainKeys.forEach((key) => {
                    const keyCopy = key;
                    keyCopy.innerHTML = metaShift
                        ? key.innerHTML.toLowerCase()
                        : key.innerHTML.toUpperCase();
                });
            }

            if (metaCaps && downEvents.includes(event.type)) {
                this.metaKeyState.capslock = false;

                this.plainKeys.forEach((key) => {
                    const keyCopy = key;
                    keyCopy.innerHTML = metaShift
                        ? key.innerHTML.toUpperCase()
                        : key.innerHTML.toLowerCase();
                });
            }
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

    buildKeyboard(lang) {
        const keyboardDiv = document.createElement('div');
        keyboardDiv.classList.add('keyboard');

        const currentKeyboard = lang === 'en' ? keyboardEn : keyboardRu;

        currentKeyboard.map((row) => {
            const rowContainer = document.createElement('div');

            rowContainer.classList.add('row');
            keyboardDiv.appendChild(rowContainer);

            return row.map((item) => {
                const mappedKey = Key(item.symbols, item.code, item.type);

                // preserve caps state on rebuild
                if (item.code === 'CapsLock' && this.metaKeyState.capslock) {
                    mappedKey.classList.add('pressed');
                }

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

                    if (code === 'CapsLock' && this.metaKeyState.capslock) {
                        this.keyAction(event, code, null);
                        this.textbox.focus();

                        return;
                    }

                    key.classList.remove('pressed');
                    this.keyAction(event, code, null);
                    this.textbox.focus();
                });

                mappedKey.addEventListener('mouseleave', (event) => {
                    const { code } = event.target.dataset;

                    const key = document.querySelector(`[data-code="${code}"]`);

                    if (code === 'CapsLock' && this.metaKeyState.capslock) {
                        this.keyAction(event, code, null);
                        this.textbox.focus();

                        return;
                    }

                    key.classList.remove('pressed');
                    this.keyAction(event, code, null);
                    this.textbox.focus();
                });

                return rowContainer.appendChild(mappedKey);
            });
        });

        keyboardDiv.appendChild(this.buildHelp());

        return keyboardDiv;
    }

    buildHelp() {
        this.helpContainer = document.createElement('div');
        const aboutKeyboard = document.createElement('p');
        aboutKeyboard.classList.add('about-keyboard');
        aboutKeyboard.innerHTML =
            'Клавиатура написана в операционной системе Windows';

        const langChangeShortcut = document.createElement('p');
        langChangeShortcut.classList.add('about-lang');
        langChangeShortcut.innerHTML =
            'Для переключения раскладки воспользуйтесь Alt + Shift';

        this.helpContainer.appendChild(aboutKeyboard);
        this.helpContainer.appendChild(langChangeShortcut);

        return this.helpContainer;
    }

    destroyKeyboard() {
        this.keyboard = document.querySelector('.keyboard');

        if (this.keyboard) {
            this.keyboard.remove();
        }
    }

    registerWindowListeners() {
        let pressedKeys = [];

        const handleKeyDown = (event) => {
            this.textbox.focus();
            event.preventDefault();

            const { code } = event;

            pressedKeys.push(code);

            const key = document.querySelector(`[data-code="${code}"]`);

            // don't proccess any key that not present on the keyboard
            if (!key) {
                return;
            }

            const multiSymbol = this.metaKeyState.shift ? 0 : 1;
            const value = key.dataset.multi
                ? key.innerHTML.split('<br>')[multiSymbol]
                : key.innerHTML;

            key.classList.add('pressed');

            this.keyAction(event, code, value);
            this.textbox.focus();
        };

        window.addEventListener('keydown', handleKeyDown);

        const handleKeyUp = (event) => {
            const { code: codeUp } = event;

            if (pressedKeys.includes(codeUp)) {
                pressedKeys = pressedKeys.filter((item) => item !== codeUp);

                const key = document.querySelector(`[data-code="${codeUp}"]`);

                // don't proccess any key that not present on the keyboard
                if (!key) {
                    return;
                }

                // don't disable pressed state for caps
                if (codeUp === 'CapsLock' && this.metaKeyState.capslock) {
                    this.keyAction(event, codeUp, null);

                    return;
                }

                key.classList.remove('pressed');
                this.keyAction(event, codeUp, null);
            }

            this.textbox.focus();
        };

        window.addEventListener('keyup', handleKeyUp);
    }

    init() {
        const currentLang = this.getLang();

        this.setLang(currentLang);

        this.rootContainer.appendChild(this.buildInputBox());
        this.rootContainer.appendChild(this.buildKeyboard(currentLang));

        this.registerWindowListeners();

        this.textbox.addEventListener('blur', () => {
            this.textbox.focus();
        });

        this.plainKeys = document.querySelectorAll("[data-single='true']");
        this.multiKeys = document.querySelectorAll("[data-multi='true']");
    }
}
