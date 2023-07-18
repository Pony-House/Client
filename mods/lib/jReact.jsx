import { renderToStaticMarkup } from 'react-dom/server';

export default function jReact(dom, config = {}) {
    return $(renderToStaticMarkup(dom), config);
};