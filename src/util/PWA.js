let deferredPrompt;
window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {

    const body = $('body');
    body.removeClass('window-browser').removeClass('window-standalone');

    let displayMode = 'browser';
    if (evt.matches) {
        displayMode = 'standalone';
    }

    // Log display mode change to analytics
    console.log(`[PWA] DISPLAY_MODE_CHANGED`, displayMode);
    body.addClass(`window-${displayMode}`);

});

window.addEventListener('beforeinstallprompt', (e) => {

    // Prevent the mini-infobar from appearing on mobile
    // e.preventDefault();

    // Stash the event so it can be triggered later.
    deferredPrompt = e;

    // Update UI notify the user they can install the PWA
    // showInstallPromotion();

    // Optionally, send analytics event that PWA install promo was shown.
    console.log(`[PWA] 'beforeinstallprompt' event was fired.`);

});

window.addEventListener('appinstalled', () => {

    // Hide the app-provided install promotion
    // hideInstallPromotion();

    // Clear the deferredPrompt so it can be garbage collected
    deferredPrompt = null;

    // Optionally, send analytics event to indicate successful install
    console.log(`[PWA] PWA was installed`);

});

if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log(`[PWA] This is running as standalone.`);
    $('body').addClass(`window-standalone`);
} else {
    console.log(`[PWA] This is running as browser.`);
    $('body').addClass(`window-browser`);
}

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