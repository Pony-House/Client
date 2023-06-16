/* freezeGif(e.target, 42); */
export function freezeGif(img, wantedWidth) {

    function createElement(type, callback) {
        const element = document.createElement(type);

        callback(element);

        return element;
    }

    const { width } = img;
    const { height } = img;

    const canvas = createElement('canvas', clone => {
        clone.width = width;
        clone.height = height;
    });
    let attr;
    let i = 0;

    const freeze = () => {

        const ctx = canvas.getContext('2d');

        if (wantedWidth) {
            const aspect = width / height;
            canvas.width = wantedWidth;
            canvas.height = wantedWidth / aspect;
        } else {
            canvas.width = width;
            canvas.height = height;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        for (i = 0; i < img.attributes.length; i++) {
            attr = img.attributes[i];

            if (attr.name !== '"') { // test for invalid attributes
                canvas.setAttribute(attr.name, attr.value);
            }
        }

        canvas.classList.add('normal-avatar');
        canvas.classList.remove('anim-avatar');

        img.parentNode.insertBefore(canvas, img);

    };

    if (img.complete) {
        freeze();
    } else {
        img.addEventListener('load', freeze, true);
    }

};
