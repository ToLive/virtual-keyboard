import VirtualKeyboard from './VirtualKeyboard';
import Key from './Key';

describe('VirtualKeyboard', () => {
    let element;
    let virtualKeyboard;

    beforeAll(() => {
        element = document.createElement('div');
        virtualKeyboard = new VirtualKeyboard(element);
        virtualKeyboard.init();
    });

    describe('Check if inputbox is present', () => {
        it('should create a textarea element with the class "textbox__input"', () => {
            const textbox = element.querySelector('.textbox__input');
            expect(textbox).toBeTruthy();
        });
    });

    describe('Check if onscreen keyboard is present', () => {
        it('should create a div element with the class "keyboard"', () => {
            const keyboard = element.querySelector('.keyboard');
            expect(keyboard).toBeTruthy();
        });

        it('should add all the keys to the keyboard', () => {
            const keys = element.querySelectorAll('.key');
            expect(keys.length).toBe(64);
        });
    });

    describe('Check textbox operations by one', () => {
        beforeEach(() => {
            virtualKeyboard.textbox = document.createElement('textarea');
            const text = 'Hello, World!';
            virtualKeyboard.textbox.innerHTML = text;

            // set carret at the end of the text
            virtualKeyboard.textbox.setRangeText(
                '',
                text.length - 1,
                text.length - 1,
                'end'
            );
        });

        it('should insert text at the current position', () => {
            virtualKeyboard.modifyTextAtCursor('a', 'Insert');
            expect(virtualKeyboard.textbox.value).toBe('Hello, World!a');
        });

        it('should delete one character to the left of the current position when pressing backspace', () => {
            virtualKeyboard.modifyTextAtCursor('', 'Backspace');
            expect(virtualKeyboard.textbox.value).toBe('Hello, World');
        });

        it('should delete one character to the right of the current position when pressing delete', () => {
            virtualKeyboard.textbox.setRangeText(
                '',
                virtualKeyboard.textbox.value.length - 1,
                virtualKeyboard.textbox.value.length - 1,
                'start'
            );

            virtualKeyboard.modifyTextAtCursor('', 'Delete');

            expect(virtualKeyboard.textbox.value).toBe('Hello, World');
        });

        it('should insert a tab character at the current position when pressing the tab key', () => {
            virtualKeyboard.modifyTextAtCursor('', 'Tab');
            virtualKeyboard.modifyTextAtCursor('', 'Tab');
            virtualKeyboard.modifyTextAtCursor('', 'Tab');
            expect(virtualKeyboard.textbox.value).toBe('Hello, World!\t\t\t');
        });

        it('should insert a new line character at the current position when pressing the enter key', () => {
            virtualKeyboard.modifyTextAtCursor('', 'Enter');
            virtualKeyboard.modifyTextAtCursor('', 'Enter');
            expect(virtualKeyboard.textbox.value).toBe('Hello, World!\n\n');
        });

        it('should insert a space character at the current position when pressing the space key', () => {
            virtualKeyboard.modifyTextAtCursor('', 'Space');
            virtualKeyboard.modifyTextAtCursor('', 'Space');
            virtualKeyboard.modifyTextAtCursor('', 'Space');
            virtualKeyboard.modifyTextAtCursor('', 'Space');
            expect(virtualKeyboard.textbox.value).toBe('Hello, World!    ');
        });
    });

    describe('Check textbox several operations at once', () => {
        beforeAll(() => {
            virtualKeyboard.textbox = document.createElement('textarea');

            virtualKeyboard.textbox.setRangeText('', 0, 0, 'start');
        });

        it('should insert character at the end', () => {
            virtualKeyboard.modifyTextAtCursor('H', 'Insert');
            virtualKeyboard.modifyTextAtCursor('e', 'Insert');
            virtualKeyboard.modifyTextAtCursor('l', 'Insert');
            virtualKeyboard.modifyTextAtCursor('l', 'Insert');
            virtualKeyboard.modifyTextAtCursor('o', 'Insert');
            expect(virtualKeyboard.textbox.value).toBe('Hello');
        });

        it('should delete character at the end', () => {
            virtualKeyboard.modifyTextAtCursor('', 'Backspace');
            virtualKeyboard.modifyTextAtCursor('', 'Backspace');
            expect(virtualKeyboard.textbox.value).toBe('Hel');
        });

        it('should delete one character to the right of the current position when pressing delete', () => {
            virtualKeyboard.modifyTextAtCursor('l', 'Insert');
            virtualKeyboard.modifyTextAtCursor('o', 'Insert');
            virtualKeyboard.textbox.setRangeText(
                '',
                virtualKeyboard.textbox.value.length - 2,
                virtualKeyboard.textbox.value.length - 2,
                'start'
            );
            virtualKeyboard.modifyTextAtCursor('', 'Delete');
            virtualKeyboard.modifyTextAtCursor('', 'Delete');
            expect(virtualKeyboard.textbox.value).toBe('Hel');
        });

        it('should insert a tab character at the current position when pressing the tab key', () => {
            virtualKeyboard.modifyTextAtCursor('', 'Tab');
            virtualKeyboard.modifyTextAtCursor('', 'Tab');
            virtualKeyboard.modifyTextAtCursor('l', 'Insert');
            virtualKeyboard.modifyTextAtCursor('o', 'Insert');
            expect(virtualKeyboard.textbox.value).toBe('Hel\t\tlo');
        });

        it('should insert a new line character at the current position when pressing the enter key', () => {
            virtualKeyboard.modifyTextAtCursor('', 'Enter');
            virtualKeyboard.modifyTextAtCursor('W', 'Insert');
            virtualKeyboard.modifyTextAtCursor('o', 'Insert');
            virtualKeyboard.modifyTextAtCursor('r', 'Insert');
            virtualKeyboard.modifyTextAtCursor('l', 'Insert');
            virtualKeyboard.modifyTextAtCursor('d', 'Insert');
            expect(virtualKeyboard.textbox.value).toBe('Hel\t\tlo\nWorld');
        });

        it('should insert a space character at the current position when pressing the space key', () => {
            virtualKeyboard.modifyTextAtCursor('', 'Space');
            virtualKeyboard.modifyTextAtCursor('', 'Space');
            expect(virtualKeyboard.textbox.value).toBe('Hel\t\tlo\nWorld  ');
        });
    });
});
