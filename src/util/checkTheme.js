export function isBottomPage() {
    return ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight);
}

export function selectButton() {

    const body = $('body');
    if (body.length > 0) {

        if (body.hasClass('theme-type-dark')) {
            return 'dark';
        }

        if (body.hasClass('theme-type-dark2')) {
            return 'secondary';
        }

    }

    return 'light'

}

export function selectButtonInverse() {

    const body = $('body');
    if (body.length > 0) {

        if (body.hasClass('theme-type-dark') || body.hasClass('theme-type-dark2') || body.hasClass('theme-type-silver')) {
            return 'secondary';
        }

    }

    return 'light'

}