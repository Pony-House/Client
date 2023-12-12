import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import moment from '../../../src/util/libs/momentjs';

import jReact from '../jReact';

export default function helloWorld() {

    // Normal Welcome
    console.log(`[Tiny Plugin] Hello World!`, moment());

    // jQuery Welcome
    console.log(`[Tiny Plugin] jQuery + React Demo`,
        jReact(<small>Hello World in react!</small>)
    );

    // Vanilla Welcome
    console.log(`[Tiny Plugin] Vanilla React Demo`, renderToStaticMarkup(
        <small>Hello World in react!</small>
    ));

};