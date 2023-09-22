import React from 'react';

import initMatrix from '../../../../client/initMatrix';
import cons from '../../../../client/state/cons';
import Button from '../../../atoms/button/Button';

function AboutSection() {
    return (
        <div className="noselect">

            <div className="card">

                <ul className="list-group list-group-flush">

                    <li className="list-group-item very-small text-gray">Application</li>

                    <li className="list-group-item border-0">

                        <div className='row m-0 w-100'>

                            <div className='col-md-1 ps-0'>
                                <img width="60" height="60" src="./favicon.ico" alt="Cinny logo" />
                            </div>

                            <div className='col-md-11 pe-0'>

                                <h4>
                                    {__ENV_APP__.info.name}
                                    <span className="very-small text-gray" style={{ margin: '0 var(--sp-extra-tight)' }}>{`v${cons.version}`}</span>
                                </h4>

                                <div>The open source house, your house, the house for all matrix ponies</div>

                                <div className="mt-3">
                                    <Button className='me-1' onClick={() => window.open('https://github.com/Pony-House/Client')}>Source code</Button>
                                    <Button className='mx-1' onClick={() => window.open('https://puddy.club/')}>Support</Button>
                                    <Button className='ms-1' onClick={() => initMatrix.clearCacheAndReload()} variant="danger">Clear cache & reload</Button>
                                </div>

                            </div>

                        </div>

                    </li>

                </ul>

            </div>

            <div className="card mt-3">

                <ul className="list-group list-group-flush">

                    <li className="list-group-item very-small text-gray">Matrix Client</li>

                    <li className="list-group-item border-0">
                        <div className='small'>Matrix JS SDK - {__ENV_APP__.deps['matrix-js-sdk']}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Matrix CRDT - {__ENV_APP__.deps['matrix-crdt']}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Matrix Widget API - {__ENV_APP__.deps['matrix-widget-api']}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Moment Timezone - {__ENV_APP__.deps['moment-timezone']}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Photo Swipe - {__ENV_APP__.deps.photoswipe}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Socket.IO Client - {__ENV_APP__.deps.photoswipe}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Vega - {__ENV_APP__.deps.vega}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Web3.js - {__ENV_APP__.deps.web3}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Yjs - {__ENV_APP__.deps.yjs}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Bootstrap UI - {__ENV_APP__.deps.bootstrap}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Bootstrap Icons - {__ENV_APP__.deps['bootstrap-icons']}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Font Awesome - {__ENV_APP__.deps['@fortawesome/fontawesome-free']}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Crypto Fonts - {__ENV_APP__.deps.cryptofonts}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Emoji Mart Data - {__ENV_APP__.deps['@emoji-mart/data']}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Jitsi - {__ENV_APP__.deps['@jitsi/react-sdk']}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>jQuery - {__ENV_APP__.deps.jquery}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>jQuery UI - {__ENV_APP__.deps['jquery-ui']}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Linkifyjs - {__ENV_APP__.deps.linkifyjs}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>OLM Version - {initMatrix.matrixClient.olmVersion.join('.')}</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>Verification Methods - {initMatrix.matrixClient.verificationMethods.join(', ')}</div>
                    </li>

                </ul>

            </div>

            <div className="card mt-3">

                <ul className="list-group list-group-flush">

                    <li className="list-group-item very-small text-gray">Credits</li>

                    <li className="list-group-item border-0">
                        <div className='small'>The <a href="https://github.com/matrix-org/matrix-js-sdk" rel="noreferrer noopener" target="_blank">matrix-js-sdk</a> is © <a href="https://matrix.org/foundation" rel="noreferrer noopener" target="_blank">The Matrix.org Foundation C.I.C</a> used under the terms of <a href="http://www.apache.org/licenses/LICENSE-2.0" rel="noreferrer noopener" target="_blank">Apache 2.0</a>.</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>The <a href="https://twemoji.twitter.com" target="_blank" rel="noreferrer noopener">Twemoji</a> emoji art is © <a href="https://twemoji.twitter.com" target="_blank" rel="noreferrer noopener">Twitter, Inc and other contributors</a> used under the terms of <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer noopener">CC-BY 4.0</a>.</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>The <a href="https://material.io/design/sound/sound-resources.html" target="_blank" rel="noreferrer noopener">Material sound resources</a> are © <a href="https://google.com" target="_blank" rel="noreferrer noopener">Google</a> used under the terms of <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer noopener">CC-BY 4.0</a>.</div>
                    </li>

                    <li className="list-group-item border-0">
                        <div className='small'>{`The ${__ENV_APP__.info.name} is a fork from the `}<a href="https://github.com/cinnyapp/cinny" target="_blank" rel="noreferrer noopener">Cinny</a>. All source code base credits go to this group.</div>
                    </li>

                </ul>

            </div>

        </div>

    );
};

export default AboutSection;