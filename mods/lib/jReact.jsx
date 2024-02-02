import { renderToStaticMarkup } from 'react-dom/server';

export default function jReact(dom, config = {}) {
  let result = null;

  try {
    result = renderToStaticMarkup(dom);
  } catch (err) {
    result = null;
    console.error(err);
  }

  return $(result, config);
}
