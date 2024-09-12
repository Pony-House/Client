import React, { useState, useEffect } from 'react';

import { softwareVersions } from '@src/versions';
import { fetchFn } from '@src/client/initMatrix';

import { twemojifyReact } from '../../../util/twemojify';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';

import Dialog from '../../molecules/dialog/Dialog';
import { markdown } from '@src/util/markdown';

function Changelog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [content, setContent] = useState(null);

  const version = cons.version.split('.');
  const [vp1, setVp1] = useState(null);
  const [vp2, setVp2] = useState(null);
  const [vp3, setVp3] = useState(null);

  const closeDialog = () => setIsOpen(false);
  const afterClose = () => {
    setIsOpen(false);
    setLoading(false);
    setContent(null);
    setVp1(null);
    setVp2(null);
    setVp3(null);
  };

  useEffect(() => {
    const openChangelog = (v) => {
      afterClose();
      if (typeof v === 'string') {
        const openVersion = v.split('.');
        if (typeof openVersion[0] === 'string') setVp1(openVersion[0]);

        if (typeof openVersion[1] === 'string') setVp2(openVersion[1]);

        if (typeof openVersion[2] === 'string') setVp3(openVersion[2]);
      }
      setIsOpen(true);
    };

    if (vp1 && vp2 && vp3 && !content && !isLoading && isOpen) {
      const vp3Fix = vp3.split('-')[0];
      if (
        softwareVersions[vp1] &&
        softwareVersions[vp1][vp2] &&
        softwareVersions[vp1][vp2][vp3Fix]
      ) {
        setLoading(true);
        fetchFn(`./changelog/${vp1}/${vp2}/${vp3Fix}.md`)
          .then((res) => res.text())
          .then((data) => {
            setLoading(false);
            setContent(data);
          })
          .catch((err) => {
            alert(err.message, 'Changelog Error');
            console.error(err);
            setLoading(false);
            setContent('NULL');
          });
      }
    }

    navigation.on(cons.events.navigation.CHANGELOG_OPENED, openChangelog);
    return () => {
      navigation.removeListener(cons.events.navigation.CHANGELOG_OPENED, openChangelog);
    };
  });

  console.log(content, isLoading, softwareVersions, version);

  // Read Modal
  return (
    <Dialog
      bodyClass="bg-bg2 p-0"
      className="modal-dialog-centered modal-lg noselect modal-dialog-changelog"
      isOpen={isOpen}
      title="Changelog"
      onAfterClose={afterClose}
      onRequestClose={closeDialog}
    >
      <div className="p-3">
        {!isLoading ? (
          <>
            <h4>Version {cons.version}</h4>
            <div className="text-freedom">
              {content
                ? twemojifyReact(markdown(content, '', '', {}).html, undefined, true, false, true)
                : null}
            </div>
          </>
        ) : null}
      </div>
    </Dialog>
  );
}

export default Changelog;
