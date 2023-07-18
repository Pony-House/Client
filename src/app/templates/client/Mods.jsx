import React, { useEffect, useRef } from 'react';

export default function Mods() {

    const scriptsRef = useRef(null);

    useEffect(() => {
        console.log(`[mods] Base meta loaded.`, scriptsRef.current);
    });

    return (<script ref={scriptsRef} id="mods" />);

};