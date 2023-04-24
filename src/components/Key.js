export default function (types = null, symbols, code) {
    const keyContainer = document.createElement('span');
    keyContainer.dataset.code = code;

    keyContainer.classList.add('key');

    if (types) {
        keyContainer.classList.add(...types);
    }

    keyContainer.innerHTML = symbols.length > 1 ? `${symbols[0]}<br/>${symbols[1]}` : symbols[0];

    return keyContainer;
}