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