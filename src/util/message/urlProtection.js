
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

import { btModal, objType } from '../tools';
import tinyAPI from '../mods';

const openUrl = (url) => new Promise((resolve, reject) => {

    // Mobile
    if (Capacitor.isNativePlatform()) {
        Browser.open({ url }).then(resolve).catch(reject);
    }

    // Browser
    else {
        resolve(global.open(url, '_blank'));
    }

});

export default async (url) => {
    try {

        // Prepare Whitelist
        const whiteList = JSON.parse(localStorage.getItem('pony-house-urls-whitelist') ?? '[]');
        let urlAllowed = false;

        // Checker Value
        const tinyUrl = new URL(url);
        let tinyValue = tinyUrl.origin;
        if (typeof tinyValue !== 'string' || tinyValue === 'null') {
            tinyValue = tinyUrl.protocol;
        }

        // Start loading
        $.LoadingOverlay('show');
        let scammerCache;

        try {
            scammerCache = await tinyAPI.emitAsync('openUrlChecker', tinyUrl.hostname || tinyUrl.host, tinyUrl.protocol);
        } catch (err) {
            scammerCache = null;
            console.error(err);
        }

        const isScammer = (objType(scammerCache, 'object') && scammerCache.isScammer);

        // Read Whitelist
        if (whiteList.indexOf(tinyValue) > -1) urlAllowed = true;
        if (!urlAllowed) {

            const body = $('<center>', { class: 'small' }).append(

                $('<p>', { class: isScammer ? 'text-danger' : null }).text(isScammer ?
                    'The domain was detected in a scammer database! Are you sure you want to continue? Proceed at your own risk!' :
                    'This link is taking you to the following website'
                ),

                $('<div>', { class: 'card' }).append(
                    $('<div>', { class: `card-body text-break${isScammer ? ' text-warning' : ''}` }).text(url)
                ),

                (typeof tinyValue === 'string' && tinyValue !== 'null' && $('<div>', { class: 'form-check mt-2 text-start' }).append(
                    $('<input>', { type: 'checkbox', class: 'form-check-input', id: 'whitelist-the-domain' }),
                    $('<label>', { class: 'form-check-label small', for: 'whitelist-the-domain' }).html(`Trust <strong>${typeof tinyUrl.hostname === 'string' && tinyUrl.hostname.length > 0 && tinyUrl.hostname !== 'null' ? tinyUrl.hostname : 'protocol'}</strong> links from now on`)
                ))

            );

            const tinyModal = btModal({

                id: 'trust-tiny-url',
                title: `Leaving ${__ENV_APP__.info.name}`,

                dialog: 'modal-dialog-centered modal-lg',
                body,

                footer: [
                    $('<button>', { class: 'btn btn-bg mx-2' }).text('Go Back').on('click', () => tinyModal.hide()),
                    $('<button>', { class: `btn ${isScammer ? ' btn-danger' : 'btn-primary'} mx-2` }).text('Visit Site').prepend(
                        isScammer ? $('<i>', { class: 'fa-solid fa-circle-radiation me-2' }) : null
                    ).on('click', () => {

                        if (typeof tinyValue === 'string' && tinyValue !== 'null' && $('#whitelist-the-domain').is(':checked')) {
                            whiteList.push(tinyValue);
                            global.localStorage.setItem('pony-house-urls-whitelist', JSON.stringify(whiteList));
                        }

                        openUrl(url).then(() => {
                            tinyModal.hide();
                            $.LoadingOverlay('hide');
                        }).catch(err => {
                            console.error(err);
                            alert(err.message);
                            tinyModal.hide();
                            $.LoadingOverlay('hide');
                        });


                    }),
                ],

            });

            $.LoadingOverlay('hide');

        } else if (urlAllowed) {
            openUrl(url).then(() => {
                $.LoadingOverlay('hide');
            }).catch(err => {
                console.error(err);
                alert(err.message);
                $.LoadingOverlay('hide');
            });
        }

    } catch (err) {
        alert(err.message, 'Error - Open External url');
        console.error(err);
    }
};