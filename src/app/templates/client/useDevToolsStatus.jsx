import React, { useState, useEffect } from 'react';
import devtoolsDetect from 'devtools-detect';

export function useDevToolsStatus() {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(devtoolsDetect.isOpen);

  useEffect(() => {
    const handleChange = (event) => {
      if (event.detail.isOpen)
        console.log(__ENV_APP__.CONSOLE.OPEN_WARNING[0], __ENV_APP__.CONSOLE.OPEN_WARNING[1]);
      setIsDevToolsOpen(event.detail.isOpen);
    };

    window.addEventListener('devtoolschange', handleChange);

    return () => {
      window.removeEventListener('devtoolschange', handleChange);
    };
  }, []);

  return isDevToolsOpen;
}

if (__ENV_APP__.MODE === 'development') {
  global.devtoolsDetect = devtoolsDetect;
}
