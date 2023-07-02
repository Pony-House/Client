import $ from 'jquery';
import { getFileContentType } from '../../../util/fileMime';

import ImageBrokenSVG from '../../../../public/res/svg/image-broken.svg';

export default function loadAvatar(e) {

    // Prepare Data
    const img = $(e.target);
    let animParentsCount = Number(img.attr('animparentscount'));
    if (Number.isNaN(animParentsCount) || !Number.isFinite(animParentsCount) || animParentsCount < 0 || animParentsCount > 20) animParentsCount = 0;

    const avatars = {
        animate: img.attr('animsrc'),
        normal: img.attr('normalsrc'),
    };

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
                    for (let i = 0; i < animParentsCount; i++) {
                        tinyNode = tinyNode.parentNode;
                    }

                    // Final Node
                    tinyNode = $(tinyNode);

                    // Insert Effects
                    tinyNode.hover(
                        () => {
                            img.attr('src', avatars.animate);
                        }, () => {
                            img.attr('src', avatars.normal);
                        }
                    );

                }

                // Set Normal Image
                img.attr('src', avatars.normal);

                // Invalid values here
            } else { img.attr('src', ImageBrokenSVG); }
        } else { img.attr('src', ImageBrokenSVG); }

    }).catch(err => {
        console.error(err);
        img.attr('src', ImageBrokenSVG);
    });

};