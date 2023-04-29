const Key = (symbols, code, types = null) => {
    const keyContainer = document.createElement('span');
    keyContainer.dataset.code = code;

    keyContainer.classList.add('key');

    if (types) {
        keyContainer.classList.add(...types);
    }

    const mainSymbol = symbols[0].toLowerCase();
    const secondarySymbol = symbols.length > 1 ? symbols[1] : undefined;

    keyContainer.innerHTML =
        symbols.length > 1
            ? `${mainSymbol}<br/>${secondarySymbol}`
            : mainSymbol;

    return keyContainer;
};

export default Key;
