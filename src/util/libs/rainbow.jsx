import React from 'react';
import RainbowText from 'react-rainbow-text';
import { renderToStaticMarkup } from 'react-dom/server';

export default function rainbowText(text, data = {}) {
    return renderToStaticMarkup(<RainbowText
        lightness={typeof data.lightness === 'number' ? data.lightness : 1}
        saturation={typeof data.saturation === 'number' ? data.saturation : 1}
        opacity={typeof data.opacity === 'number' ? data.opacity : 1}
    >{text}</RainbowText>);
};