import VirtualKeyboard from '@components/VirtualKeyboard';

export default () => {
    const { body } = document;
    const root = document.createElement('div');
    body.appendChild(root);

    const obj = new VirtualKeyboard(root);
    obj.init();
};
