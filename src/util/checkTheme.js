import $ from 'jquery';

export function isBottomPage() {
    return ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight);
}

export function selectButton() {

    const body = $('body');
    if (body.length > 0) {

        if (body.hasClass('dark-theme') || body.hasClass('black-theme')) {
            return 'dark';
        }

        if (body.hasClass('butter-theme')) {
            return 'secondary';
        }

    }

    return 'light'

}

export function selectButtonInverse() {

    const body = $('body');
    if (body.length > 0) {

        if (body.hasClass('dark-theme') || body.hasClass('black-theme')) {
            return 'secondary';
        }

        if (body.hasClass('butter-theme')) {
            return 'secondary';
        }

    }

    return 'light'

}