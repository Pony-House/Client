/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect } from 'react';
import startMods from '../../../../mods';

export default function Mods() {
    useEffect(() => {
        startMods();
        console.log(`[mods] Base meta loaded.`);
    });
    return <></>;
};