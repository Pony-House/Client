import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import hljs from 'highlight.js';
import cons from '../../../client/state/cons';
import navigation from '../../../client/state/navigation';
import { hljsFixer } from '../../../util/tools';

import PopupWindow from '../../molecules/popup-window/PopupWindow';

function ViewSourceBlock({ title, json, className }) {
  useEffect(() => {
    $('.insert-hljs').each((index, element) => {
      hljs.highlightElement(element);

      const el = $(element);

      el.removeClass('insert-hljs');
      hljsFixer(el, 'ViewSource');
    });
  }, []);

  return (
    <div className={`card ${className}`}>
      <ul className="list-group list-group-flush">
        <li className="list-group-item very-small text-gray noselect">{title}</li>
        <pre>
          <code className="insert-hljs language-json bg-bg3">{JSON.stringify(json, null, 2)}</code>
        </pre>
      </ul>
    </div>
  );
}
ViewSourceBlock.defaultProps = {
  className: '',
};
ViewSourceBlock.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  json: PropTypes.shape({}).isRequired,
};

function ViewSource() {
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const loadViewSource = (e) => {
      setEvent(e);
      setIsOpen(true);
    };
    navigation.on(cons.events.navigation.VIEWSOURCE_OPENED, loadViewSource);
    return () => {
      navigation.removeListener(cons.events.navigation.VIEWSOURCE_OPENED, loadViewSource);
    };
  }, []);

  const handleAfterClose = () => {
    setEvent(null);
  };

  const renderViewSource = () => (
    <div className="view-source">
      {event.isEncrypted() && (
        <ViewSourceBlock title="Decrypted source" json={event.getEffectiveEvent()} />
      )}
      <ViewSourceBlock className="mt-3" title="Original source" json={event.event} />
    </div>
  );

  return (
    <PopupWindow
      size="modal-xl"
      isOpen={isOpen}
      title="View source"
      onAfterClose={handleAfterClose}
      onRequestClose={() => setIsOpen(false)}
    >
      {event ? renderViewSource() : <div />}
    </PopupWindow>
  );
}

export default ViewSource;
