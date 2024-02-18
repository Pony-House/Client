import React from 'react';

import initMatrix from '../../../../client/initMatrix';
import cons from '../../../../client/state/cons';
import Button from '../../../atoms/button/Button';

function AboutSection() {
  const deps = [
    ['Matrix JS SDK', __ENV_APP__.DEPS['matrix-js-sdk']],
    ['Moment Timezone', __ENV_APP__.DEPS['moment-timezone']],
    ['Photo Swipe', __ENV_APP__.DEPS.photoswipe],
    ['Ethers', __ENV_APP__.DEPS.ethers],
    ['Yjs', __ENV_APP__.DEPS.yjs],
    ['Bootstrap UI', __ENV_APP__.DEPS.bootstrap],
    ['Bootstrap Icons', __ENV_APP__.DEPS['bootstrap-icons']],
    ['Font Awesome', __ENV_APP__.DEPS['@fortawesome/fontawesome-free']],
    ['Crypto Fonts', __ENV_APP__.DEPS['@cryptofonts/cryptofont']],
    ['Emoji Data', __ENV_APP__.DEPS['emojibase-data']],
    ['jQuery', __ENV_APP__.DEPS.jquery],
    ['jQuery UI', __ENV_APP__.DEPS['jquery-ui']],
    ['Linkifyjs', __ENV_APP__.DEPS.linkifyjs],
    ['OLM Version', initMatrix.matrixClient.olmVersion.join('.')],
    ['Verification Methods', initMatrix.matrixClient.verificationMethods.join(', ')],
  ];

  return (
    <div className="noselect">
      <div className="card">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Application</li>

          <li className="list-group-item border-0">
            <div className="row m-0 w-100">
              <div className="col-md-1 ps-0">
                <img width="60" height="60" src="./img/png/cinny-main.png" alt="App logo" />
              </div>

              <div className="col-md-11 pe-0">
                <h4>
                  {__ENV_APP__.INFO.name}
                  <span
                    className="very-small text-gray"
                    style={{ margin: '0 var(--sp-extra-tight)' }}
                  >{`v${cons.version}`}</span>
                </h4>

                <div>{__ENV_APP__.INFO.description}</div>

                <div className="mt-3">
                  <Button
                    className="me-1"
                    onClick={() => window.open('https://github.com/Pony-House/Client')}
                  >
                    Source code
                  </Button>
                  <Button className="mx-1" onClick={() => window.open('https://puddy.club/')}>
                    Support
                  </Button>
                  <Button
                    className="ms-1"
                    onClick={() => initMatrix.clearCacheAndReload()}
                    variant="danger"
                  >
                    Clear cache & reload
                  </Button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div className="card mt-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Matrix Client</li>
          {deps.map((dep) => (
            <li className="list-group-item border-0">
              <div className="small">
                <strong>{dep[0]}</strong> - {dep[1]}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card mt-3">
        <ul className="list-group list-group-flush">
          <li className="list-group-item very-small text-gray">Credits</li>

          <li className="list-group-item border-0">
            <div className="small">
              The{' '}
              <a
                href="https://github.com/matrix-org/matrix-js-sdk"
                rel="noreferrer noopener"
                target="_blank"
              >
                matrix-js-sdk
              </a>{' '}
              is ©{' '}
              <a href="https://matrix.org/foundation" rel="noreferrer noopener" target="_blank">
                The Matrix.org Foundation C.I.C
              </a>{' '}
              used under the terms of{' '}
              <a
                href="http://www.apache.org/licenses/LICENSE-2.0"
                rel="noreferrer noopener"
                target="_blank"
              >
                Apache 2.0
              </a>
              .
            </div>
          </li>

          <li className="list-group-item border-0">
            <div className="small">
              The{' '}
              <a href="https://twemoji.twitter.com" target="_blank" rel="noreferrer noopener">
                Twemoji
              </a>{' '}
              emoji art is ©{' '}
              <a href="https://twemoji.twitter.com" target="_blank" rel="noreferrer noopener">
                Twitter, Inc and other contributors
              </a>{' '}
              used under the terms of{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noreferrer noopener"
              >
                CC-BY 4.0
              </a>
              .
            </div>
          </li>

          <li className="list-group-item border-0">
            <div className="small">
              The{' '}
              <a
                href="https://material.io/design/sound/sound-resources.html"
                target="_blank"
                rel="noreferrer noopener"
              >
                Material sound resources
              </a>{' '}
              are ©{' '}
              <a href="https://google.com" target="_blank" rel="noreferrer noopener">
                Google
              </a>{' '}
              used under the terms of{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noreferrer noopener"
              >
                CC-BY 4.0
              </a>
              .
            </div>
          </li>

          <li className="list-group-item border-0">
            <div className="small">
              {`The ${__ENV_APP__.INFO.name} is a fork from the `}
              <a href="https://github.com/cinnyapp/cinny" target="_blank" rel="noreferrer noopener">
                Cinny
              </a>
              . All source code base credits go to this group.
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AboutSection;
