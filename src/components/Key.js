export default function (types = 'single', symbols, handler = null) {
    const keyContainer = document.createElement('span');

    keyContainer.classList.add('key', ...types);
    keyContainer.innerHTML = symbols.length > 1 ? `${symbols[0]}<br/>${symbols[1]}` : symbols[0];

    return keyContainer;
}