import * as colors from 'console-log-colors';

let deferredPrompt;
window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {

    let displayMode = 'browser';
    if (evt.matches) {
        displayMode = 'standalone';
    }

    // Log display mode change to analytics
    console.log(`${colors.green('[PWA]')} DISPLAY_MODE_CHANGED`, displayMode);

});

window.addEventListener('beforeinstallprompt', (e) => {

    // Prevent the mini-infobar from appearing on mobile
    // e.preventDefault();

    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    // Update UI notify the user they can install the PWA
    // showInstallPromotion();

    // Optionally, send analytics event that PWA install promo was shown.
    console.log(`${colors.green('[PWA]')} 'beforeinstallprompt' event was fired.`);

});

window.addEventListener('appinstalled', () => {

    // Hide the app-provided install promotion
    // hideInstallPromotion();

    // Clear the deferredPrompt so it can be garbage collected
    deferredPrompt = null;

    // Optionally, send analytics event to indicate successful install
    console.log(`${colors.green('[PWA]')} PWA was installed`);

});

export function getPWADisplayMode() {

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (document.referrer.startsWith('android-app://')) {
        return 'twa';
    }

    if (navigator.standalone || isStandalone) {
        return 'standalone';
    }

    return 'browser';

}