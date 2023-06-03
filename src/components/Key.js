const Key = (symbols, code, types = null) => {
    const keyContainer = document.createElement('span');
    keyContainer.dataset.code = code;

    if (types && types.includes('multi')) {
        keyContainer.dataset.multi = true;
    }

    if (code.includes('Key') || (types && types.includes('single'))) {
        keyContainer.dataset.single = true;
    }

    keyContainer.classList.add('key');
    keyContainer.classList.add('glassmorphism');

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
