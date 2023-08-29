import React, {
    useEffect, useRef,
} from 'react';
import PropTypes from 'prop-types';

import * as Media from '../media/Media';
import initMatrix from '../../../client/initMatrix';
import { twemojifyReact } from '../../../util/twemojify';
import jReact from '../../../../mods/lib/jReact';

import openTinyURL from '../../../util/message/urlProtection';
import defaultAvatar from '../../atoms/avatar/defaultAvatar';

const tinyUrlAction = (event) => {
    const e = event.originalEvent;
    e.preventDefault(); openTinyURL($(event.currentTarget).attr('href'), $(event.currentTarget).attr('href')); return false;
};

// Embed Data
function Embed({ embed }) {

    // URL Ref
    const tinyUrl = useRef(null);

    useEffect(() => {
        $(tinyUrl.current).on('click', tinyUrlAction);
        return () => { $(tinyUrl.current).off('click', tinyUrlAction); };
    });

    // Matrix
    const mx = initMatrix.matrixClient;

    // Is Thumb
    const isThumb = (

        (
            embed['og:type'] !== 'article' ||
            embed['og:type'] === 'profile'
        ) &&

        !embed['og:video:url'] &&
        !embed['og:video'] &&
        !embed['og:video:secure_url'] &&

        (
            typeof embed['og:image:height'] !== 'number' ||
            typeof embed['og:image:width'] !== 'number' ||
            (embed['og:image:height'] < 512 && embed['og:image:width'] < 512) ||
            embed['og:image:height'] === embed['og:image:width']
        )

    );

    // Video
    let videoUrl = null;
    if (typeof embed['og:video:secure_url'] === 'string' && embed['og:video:secure_url'].length > 0) {
        videoUrl = embed['og:video:secure_url'];
    } else if (typeof embed['og:video'] === 'string' && embed['og:video'].length > 0) {
        videoUrl = embed['og:video'];
    } else if (typeof embed['og:video:url'] === 'string' && embed['og:video:url'].length > 0) {
        videoUrl = embed['og:video:url'];
    }


    // Is Video
    const isVideo = (
        videoUrl &&
        typeof embed['og:video:height'] &&
        typeof embed['og:video:width'] &&
        embed['og:video:type']
    );

    // Image
    let imgUrl = null;
    if (typeof embed['og:image'] === 'string' && typeof embed['og:image:secure_url'] === 'string') {
        imgUrl = embed['og:image:secure_url'].length > 0 ? embed['og:image:secure_url'] : embed['og:image'];
    } else if (typeof embed['og:image'] === 'string' && embed['og:image'].length > 0) {
        imgUrl = embed['og:image'];
    }

    const defaultVideoAvatar = defaultAvatar(1);
    if (!imgUrl && isVideo) {
        imgUrl = defaultVideoAvatar;
    }

    // Complete
    return <div className='card mt-2'>
        <div className='card-body'>

            {isThumb && typeof imgUrl === 'string' ? <span className='float-end'>
                <Media.Image
                    name='embed-img'
                    className='embed-thumb'
                    width={Number(embed['og:image:width'])}
                    height={Number(embed['og:image:height'])}
                    link={mx.mxcUrlToHttp(imgUrl, 2000, 2000)}
                    type={String(embed['og:image:type'])}
                />
            </span> : null}

            <span>

                {typeof embed['og:site_name'] === 'string' && embed['og:site_name'].length > 0 ? <p className='card-text very-small emoji-size-fix-2 mb-2'>{twemojifyReact(embed['og:site_name'])}</p> : null}

                {typeof embed['og:title'] === 'string' && embed['og:title'].length > 0 ? <h5 className='card-title small emoji-size-fix fw-bold'>
                    {typeof embed['og:url'] === 'string' && embed['og:url'].length > 0 ? <a ref={tinyUrl} href={embed['og:url']} target='_blank' rel="noreferrer">
                        {twemojifyReact(embed['og:title'])}
                    </a> : embed['og:title']}
                </h5> : null}

                {typeof embed['og:description'] === 'string' && embed['og:description'].length > 0 ? <p className='card-text text-freedom very-small emoji-size-fix-2'>
                    {twemojifyReact(embed['og:description'])}
                </p> : null}

                {embed['og:type'] === 'article' ? <>

                    {typeof embed['article:publisher'] === 'string' && embed['article:publisher'].length > 0 ? <p className='card-text very-small emoji-size-fix-2 mt-2'>
                        {twemojifyReact(embed['article:publisher'])}
                    </p> : null}

                    {typeof embed['article:section'] === 'string' && embed['article:section'].length > 0 ? <p className='card-text very-small emoji-size-fix-2 mt-2'>
                        {twemojifyReact(embed['article:section'])}
                    </p> : null}

                    {typeof embed['article:tag'] === 'string' && embed['article:tag'].length > 0 ? <p className='card-text very-small emoji-size-fix-2 mt-2'>
                        {twemojifyReact(embed['article:tag'])}
                    </p> : null}

                </> : null}

                {!isVideo && !isThumb && typeof imgUrl === 'string' && imgUrl.length > 0 ?
                    <Media.Image
                        name='embed-img'
                        className='mt-2 embed-img'
                        width={Number(embed['og:image:width'])}
                        height={Number(embed['og:image:height'])}
                        link={mx.mxcUrlToHttp(imgUrl, 2000, 2000)}
                        type={String(embed['og:image:type'])}
                    />
                    : null}


                {isVideo && typeof imgUrl === 'string' && imgUrl.length > 0 ?
                    <div className='mt-2 ratio ratio-16x9 embed-video' style={{ backgroundImage: `url('${imgUrl !== defaultVideoAvatar ? mx.mxcUrlToHttp(imgUrl, 2000, 2000) : defaultVideoAvatar}')` }} onClick={(e) => {
                        $(e.target).replaceWith(jReact(
                            <div className='mt-2 ratio ratio-16x9 embed-video enabled'>
                                <embed title={String(embed['og:title'])} src={videoUrl} allowfullscreen='' />
                            </div>
                        ))
                    }} >
                        <div className='play-button w-100 h-100' style={{ backgroundImage: `url('./img/svg/play-circle-fill.svg')` }} />
                    </div> : null}

            </span>

        </div>
    </div>;


};

// Message Default Data
Embed.defaultProps = {
    embed: {},
};

Embed.propTypes = {
    embed: PropTypes.object,
};

export default Embed;