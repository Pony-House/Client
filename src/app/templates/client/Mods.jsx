/* eslint-disable react/jsx-no-useless-fragment */
import * as colors from 'console-log-colors';
import React, { useEffect } from 'react';
import startMods from '../../../../mods';
import tinyAPI from '../../../util/mods';

export default function Mods() {
    startMods(true);
    useEffect(() => {
        tinyAPI.resetAll();
        startMods();
        console.log(`${colors.green('[mods]')} Base meta loaded.`);
    });
    return <></>;
};