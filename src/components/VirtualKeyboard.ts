import Key from '@components/Key';
import { KeyboardEn } from '@helpers/keyboardEn';
import { KeyboardRu } from '@helpers/keyboardRu';
import { Actions } from '@helpers/consts';

export default class VirtualKeyboard {
    private metaKeyState: {
        shift: boolean;
        capslock: boolean;
        alt: boolean;
    };

    private rootContainer: HTMLElement;
    private lang: string = 'en';
    public textbox: HTMLTextAreaElement | null = null;
    private plainKeys: string[] = [];
    private multiKeys: string[] = [];
    private textboxContainer: HTMLDivElement = document.createElement('div');
    private helpContainer: HTMLDivElement = document.createElement('div');

    constructor(element: HTMLElement) {
        this.rootContainer = element;

        this.metaKeyState = {
            shift: false,
            capslock: false,
            alt: false,
        };
    }

    setLang(lang: string): void {
        const allowedLang = ['ru', 'en'];

        if (!allowedLang.includes(lang)) {
            throw Error(`Wrong language: ${lang}`);
        }

        if (this.getLang() && this.getLang() !== lang) {
            this.destroyKeyboard();

            this.metaKeyState.shift = false;

            this.rootContainer.appendChild(this.buildKeyboard(lang));
        }

        this.lang = lang;

        localStorage.setItem('lang', this.lang);
    }

    getLang(): string {
        return localStorage.getItem('lang') || this.lang;
    }

    modifyTextAtCursor(newText: string | null, action: string): void {
        function getSelectionPos(
            element: HTMLTextAreaElement | null
        ): number[] {
            if (element) {
                const [start, end] = [
                    element.selectionStart,
                    element.selectionEnd,
                ];

                return [start, end];
            }

            return [0, 0];
        }

        if (!this.textbox) {
            return;
        }

        const [start, end] = getSelectionPos(this.textbox);

        if (!Actions[action] || action === Actions.Insert) {
            if (newText) {
                this.textbox.setRangeText(newText, start, end, 'end');
            }

            return;
        }

        if (action === Actions.Backspace) {
            if (start > 0) {
                this.textbox.setRangeText('', start - 1, end);
            }

            return;
        }

        if (action === Actions.Delete) {
            this.textbox.setRangeText('', start, end + 1);

            return;
        }

        if (action === Actions.Tab) {
            this.textbox.setRangeText('\t', start, end, 'end');

            return;
        }

        if (action === Actions.Enter) {
            this.textbox.setRangeText('\n', start, end, 'end');

            return;
        }

        if (action === Actions.Space) {
            this.textbox.setRangeText(' ', start, end, 'end');

            return;
        }

        if (action === Actions.ArrowLeft) {
            if (start > 0) {
                this.textbox.setRangeText('', start - 1, end - 1, 'start');
            }

            return;
        }

        if (action === Actions.ArrowRight) {
            this.textbox.setRangeText('', start + 1, end + 1, 'start');

            return;
        }

        if (window) {
            if (action === Actions.ArrowDown) {
                window.getSelection()?.modify('move', 'forward', 'line');

                return;
            }

            if (action === Actions.ArrowUp) {
                window.getSelection()?.modify('move', 'backward', 'line');

                return;
            }
        }

        if (action === Actions.MetaLeft) {
            // do nothing with WIN key
        }
    }

    keyAction(
        event: MouseEvent | KeyboardEvent,
        code: string,
        value: string | null
    ): void {
        const { AltLeft, AltRight, ShiftLeft, ShiftRight, CapsLock } = Actions;
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

                this.plainKeys.forEach((code: string) => {
                    const key = document.querySelector(`[data-code="${code}"]`);

                    if (key) {
                        key.innerHTML = metaCaps
                            ? key.innerHTML.toLowerCase()
                            : key.innerHTML.toUpperCase();
                    }
                });
            }

            if (upEvents.includes(event.type)) {
                this.metaKeyState.shift = false;

                this.plainKeys.forEach((code: string) => {
                    const key = document.querySelector(`[data-code="${code}"]`);

                    if (key) {
                        key.innerHTML = metaCaps
                            ? key.innerHTML.toUpperCase()
                            : key.innerHTML.toLowerCase();
                    }
                });
            }

            return;
        }

        if (code === CapsLock) {
            if (!metaCaps && downEvents.includes(event.type)) {
                this.metaKeyState.capslock = true;

                this.plainKeys.forEach((code: string) => {
                    const key = document.querySelector(`[data-code="${code}"]`);

                    if (key) {
                        key.innerHTML = metaShift
                            ? key.innerHTML.toLowerCase()
                            : key.innerHTML.toUpperCase();
                    }
                });
            }

            if (metaCaps && downEvents.includes(event.type)) {
                this.metaKeyState.capslock = false;

                this.plainKeys.forEach((code: string) => {
                    const key = document.querySelector(`[data-code="${code}"]`);

                    if (key) {
                        key.innerHTML = metaShift
                            ? key.innerHTML.toUpperCase()
                            : key.innerHTML.toLowerCase();
                    }
                });
            }
        }

        if (['keydown', 'mousedown'].includes(event.type)) {
            this.modifyTextAtCursor(value, code);
        }
    }

    buildInputBox(): HTMLDivElement {
        this.textboxContainer.classList.add('textbox__container');

        this.textbox = document.createElement('textarea');
        this.textbox.cols = 110;
        this.textbox.wrap = 'hard';
        this.textbox.classList.add('textbox__input');
        this.textbox.classList.add('glassmorphism');

        this.textboxContainer.appendChild(this.textbox);

        return this.textboxContainer;
    }

    buildKeyboard(lang: string): HTMLDivElement {
        const keyboardDiv: HTMLDivElement = document.createElement('div');
        keyboardDiv.classList.add('keyboard');

        const currentKeyboard = lang === 'en' ? KeyboardEn : KeyboardRu;

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

                mappedKey.addEventListener('mousedown', (event: MouseEvent) => {
                    if (
                        !this.textbox ||
                        !event ||
                        !(event.target instanceof HTMLElement)
                    ) {
                        return;
                    }

                    this.textbox.focus();

                    const { code } = event.target.dataset;

                    const key: HTMLElement | null = document.querySelector(
                        `[data-code="${code}"]`
                    );
                    const multiSymbol = this.metaKeyState.shift ? 0 : 1;

                    if (key && code) {
                        const value = key.dataset.multi
                            ? key.innerHTML.split('<br>')[multiSymbol]
                            : key.innerHTML;

                        key.classList.add('pressed');

                        this.keyAction(event, code, value);
                        this.textbox.focus();
                    }
                });

                mappedKey.addEventListener('mouseup', (event: MouseEvent) => {
                    if (
                        !this.textbox ||
                        !event ||
                        !(event.target instanceof HTMLElement)
                    ) {
                        return;
                    }

                    const { code } = event.target.dataset;

                    const key = document.querySelector(`[data-code="${code}"]`);

                    if (code === 'CapsLock' && this.metaKeyState.capslock) {
                        this.keyAction(event, code, null);
                        this.textbox.focus();

                        return;
                    }

                    if (key && code) {
                        key.classList.remove('pressed');
                        this.keyAction(event, code, null);
                        this.textbox.focus();
                    }
                });

                mappedKey.addEventListener(
                    'mouseleave',
                    (event: MouseEvent) => {
                        if (
                            !this.textbox ||
                            !event ||
                            !(event.target instanceof HTMLElement)
                        ) {
                            return;
                        }

                        const { code } = event.target.dataset;

                        const key = document.querySelector(
                            `[data-code="${code}"]`
                        );

                        if (code === 'CapsLock' && this.metaKeyState.capslock) {
                            this.keyAction(event, code, null);
                            this.textbox.focus();

                            return;
                        }

                        if (key && code) {
                            key.classList.remove('pressed');
                            this.keyAction(event, code, null);
                            this.textbox.focus();
                        }
                    }
                );

                return rowContainer.appendChild(mappedKey);
            });
        });

        keyboardDiv
            .querySelectorAll("[data-single='true']")
            .forEach((item: Element) => {
                if (item instanceof HTMLElement && item.dataset.code) {
                    this.plainKeys.push(item.dataset.code);
                }
            });

        keyboardDiv
            .querySelectorAll("[data-multi='true']")
            .forEach((item: Element) => {
                if (item instanceof HTMLElement && item.dataset.code) {
                    this.multiKeys.push(item.dataset.code);
                }
            });

        keyboardDiv.appendChild(this.buildHelp());

        return keyboardDiv;
    }

    buildHelp(): HTMLDivElement {
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

    destroyKeyboard(): void {
        const keyboard = document.querySelector('.keyboard');

        if (keyboard) {
            keyboard.remove();
        }
    }

    registerWindowListeners(): void {
        let pressedKeys: string[] = [];

        const handleKeyDown = (event: KeyboardEvent) => {
            if (!this.textbox) {
                return;
            }

            event.preventDefault();

            const { code } = event;

            pressedKeys.push(code);

            const key: HTMLElement | null = document.querySelector(
                `[data-code="${code}"]`
            );

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

        const handleKeyUp = (event: KeyboardEvent) => {
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

            if (this.textbox) {
                this.textbox.focus();
            }
        };

        window.addEventListener('keyup', handleKeyUp);
    }

    init() {
        const currentLang = this.getLang();

        this.setLang(currentLang);

        this.rootContainer.appendChild(this.buildInputBox());
        this.rootContainer.appendChild(this.buildKeyboard(currentLang));

        this.registerWindowListeners();

        if (!this.textbox) {
            return;
        }

        this.textbox.addEventListener('blur', () => {
            if (!this.textbox) {
                return;
            }

            this.textbox.focus();
        });
    }
}
