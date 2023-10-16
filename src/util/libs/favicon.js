const urlBase = './img/png/';
const favicon = {

    value: 'cinny.png'

};

export function favIconQuery() {
    return $('head > #app-favicon');
};

export function changeFavIcon(value) {
    if (typeof value === 'string') {

        const newValue = `${urlBase}${value}`;
        favicon.value = value;

        favIconQuery().attr('href', newValue);

    }
};

export function favIconValue() {
    return favicon.value;
};

export function checkerFavIcon() {

};