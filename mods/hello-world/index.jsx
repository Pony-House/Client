import * as colors from 'console-log-colors';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import jReact from '../lib/jReact';

export default function helloWorld() {

    // Normal Welcome
    console.log(`${colors.cyan('[Tiny Plugin]')} Hello World!`);

    // jQuery Welcome
    console.log(`${colors.cyan('[Tiny Plugin]')} jQuery + React Demo`,
        jReact(<small>Hello World in react!</small>)
    );

    // Vanilla Welcome
    console.log(`${colors.cyan('[Tiny Plugin]')} Vanilla React Demo`, renderToStaticMarkup(
        <small>Hello World in react!</small>
    ));

};