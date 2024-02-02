/* freezeGif(e.target, 42); */
export function freezeGif(img, wantedWidth) {
  function createElement(type, callback) {
    const element = document.createElement(type);

    callback(element);

    return element;
  }

  const { width } = img;
  const { height } = img;

  const canvas = createElement('canvas', (clone) => {
    clone.width = width;
    clone.height = height;
  });

  const canvasQuery = $(canvas);

  let attr;
  let i = 0;

  const freeze = () => {
    const ctx = canvas.getContext('2d');

    if (wantedWidth) {
      const aspect = width / height;
      canvasQuery.width(wantedWidth);
      canvasQuery.height(wantedWidth / aspect);
    } else {
      canvasQuery.width(width);
      canvasQuery.height(height);
    }

    ctx.drawImage(img, 0, 0, canvasQuery.width(), canvasQuery.height());

    for (i = 0; i < img.attributes.length; i++) {
      attr = img.attributes[i];

      if (attr.name !== '"') {
        // test for invalid attributes
        canvasQuery.attr(attr.name, attr.value);
      }
    }

    canvasQuery.addClass('normal-avatar');
    canvasQuery.removeClass('anim-avatar');

    img.parentNode.insertBefore(canvas, img);
  };

  if (img.complete) {
    freeze();
  } else {
    $(img).on('load', freeze, true);
  }
}
