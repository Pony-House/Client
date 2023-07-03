import $ from 'jquery';
import { getFileContentType } from '../../../util/fileMime';

import ImageBrokenSVG from '../../../../public/res/svg/image-broken.svg';

export default function loadAvatar(e) {

    // Prepare Data
    const img = $(e.target);
    img.attr('loadingimg', 'true');

    const avatars = {
        parents: Number(img.attr('animparentscount')),
        animate: img.attr('animsrc'),
        normal: img.attr('normalsrc'),
    };

    const loadImg = url => {
        img.attr('src', url);
    };

    if (Number.isNaN(avatars.parents) || !Number.isFinite(avatars.parents) || avatars.parents < 0 || avatars.parents > 20) avatars.parents = 0;

    if (avatars.animate !== null) loadImg(avatars.animate);
    else if (avatars.normal !== null) loadImg(avatars.normal);

    // Load Data
    getFileContentType(e, avatars.animate).then(data => {

        // Set background e prepare data validator
        img.css('background-color', 'transparent');
        if (Array.isArray(data.type) && typeof data.type[0] === 'string' && typeof data.type[1] === 'string') {
            if (data.type[0] === 'image') {

                // Gif Detected
                img.attr('image-type', data.type[1]);
                if (data.type[1] === 'gif') {

                    // Prepare Node Detector
                    let tinyNode = e.target;
                    for (let i = 0; i < avatars.parents; i++) {
                        tinyNode = tinyNode.parentNode;
                    }

                    // Final Node
                    tinyNode = $(tinyNode);

                    // Insert Effects
                    tinyNode.hover(
                        () => {
                            loadImg(avatars.animate);
                        }, () => {
                            loadImg(avatars.normal);
                        }
                    );

                }

                // Set Normal Image
                loadImg(avatars.normal);
                img.attr('loadingimg', 'false');

                // Invalid values here
            } else { loadImg(ImageBrokenSVG); img.attr('loadingimg', 'false'); }
        } else { loadImg(ImageBrokenSVG); img.attr('loadingimg', 'false'); }

    }).catch(err => {
        console.error(err);
        loadImg(ImageBrokenSVG);
        img.attr('loadingimg', 'false');
    });

};