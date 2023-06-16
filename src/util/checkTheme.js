export function isBottomPage() {
    return ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight);
}

export function selectButton() {

    if (document.body && document.body.classList) {

        if (document.body.classList.contains('dark-theme')) {
            return 'dark';
        }

        if (document.body.classList.contains('butter-theme')) {
            return 'secondary';
        }

    }

    return 'light'

}

export function selectButtonInverse() {

    if (document.body && document.body.classList) {

        if (document.body.classList.contains('dark-theme')) {
            return 'secondary';
        }

        if (document.body.classList.contains('butter-theme')) {
            return 'secondary';
        }

    }

    return 'light'

}