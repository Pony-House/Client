import $ from 'jquery';
import { getFileContentType } from '../../../util/fileMime';

import ImageBrokenSVG from '../../../../public/res/svg/image-broken.svg';

// Update Avatar Data
export function updateAvatarData(img, normalImg, animateImg) {

    // Update Data
    img.data('avatars-animate', animateImg);
    img.data('avatars-normal', normalImg);

    // Update Src
    if (animateImg !== null) img.attr('src', animateImg);
    else if (normalImg !== null) img.attr('src', normalImg);

    // Get Data
    img.attr('loadingimg', 'true');
    getFileContentType({ target: img.get(0) }, img.data('avatars-animate')).then(data => {

        // Set Data Prepare
        img.attr('loadingimg', 'true');

        // Read File Type
        if (Array.isArray(data.type) && typeof data.type[0] === 'string' && typeof data.type[1] === 'string') {
            if (data.type[0] === 'image') {

                // Change Avatar Type
                img.data('avatars-type', data.type[1]);

                // Set Normal Image
                img.attr('src', img.data('avatars-normal'));
                img.attr('loadingimg', 'false');

                // Invalid values here
            } else { img.attr('src', ImageBrokenSVG); img.attr('loadingimg', 'false'); }
        } else { img.attr('src', ImageBrokenSVG); img.attr('loadingimg', 'false'); }

    })

        // Fail
        .catch(err => {
            console.error(err);
            img.attr('src', ImageBrokenSVG);
            img.attr('loadingimg', 'false');
        });

};

// Install Avatar Data
export function installAvatarData(img) {

    // Load Type Data
    img.attr('loadingimg', 'true');
    getFileContentType({ target: img.get(0) }, img.data('avatars-animate')).then(data => {

        // Set background e prepare data validator
        img.attr('loadingimg', 'true');
        img.css('background-color', 'transparent');

        // Read File Type
        if (Array.isArray(data.type) && typeof data.type[0] === 'string' && typeof data.type[1] === 'string') {
            if (data.type[0] === 'image') {

                // Gif Detected
                img.data('avatars-type', data.type[1]);

                // Prepare Node Detector
                let tinyNode = img.get(0);
                for (let i = 0; i < img.data('avatars-parents'); i++) {
                    tinyNode = tinyNode.parentNode;
                }

                // Final Node
                tinyNode = $(tinyNode);

                // Insert Effects
                tinyNode.hover(
                    () => {
                        if (data.type[1] === 'gif' && img.data('avatars-animate')) img.attr('src', img.data('avatars-animate'));
                    }, () => {
                        if (data.type[1] === 'gif') img.attr('src', img.data('avatars-normal'));
                    }
                );

                // Set Normal Image
                img.attr('src', img.data('avatars-normal'));
                img.attr('loadingimg', 'false');

                // Invalid values here
            } else { img.attr('src', ImageBrokenSVG); img.attr('loadingimg', 'false'); }
        } else { img.attr('src', ImageBrokenSVG); img.attr('loadingimg', 'false'); }

    })

        // Fail
        .catch(err => {
            console.error(err);
            img.attr('src', ImageBrokenSVG);
            img.attr('loadingimg', 'false');
        });

};

// Load Avatar tags
export function loadAvatarTags(e) {

    // Prepare Data
    const img = $(e.target);
    img.attr('loadingimg', 'true');

    // Get Params
    const avatars = {
        parents: Number(img.attr('animparentscount')),
        animate: img.attr('animsrc'),
        normal: img.attr('normalsrc'),
    };

    // Insert Params
    img.data('avatars-animate', avatars.animate);
    img.data('avatars-normal', avatars.normal);
    img.data('avatars-default', img.attr('defaultavatar'));

    // Delete Tags
    img.removeAttr('animsrc');
    img.removeAttr('animparentscount');
    img.removeAttr('normalsrc');
    img.removeAttr('defaultavatar');

    // Fix Parents Param
    if (Number.isNaN(avatars.parents) || !Number.isFinite(avatars.parents) || avatars.parents < 0 || avatars.parents > 20) avatars.parents = 0;
    img.data('avatars-parents', avatars.parents);

    // Update Src
    if (avatars.animate !== null) img.attr('src', avatars.animate);
    else if (avatars.normal !== null) img.attr('src', avatars.normal);

    // Load Data
    return installAvatarData(img);

};