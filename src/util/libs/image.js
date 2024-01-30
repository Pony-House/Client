import imageViewer from "../imageViewer";

export function openOnGallery(imgUrl, fileName, urlRevoke = false) {

    const img = new Image();
    img.onload = function () {
        imageViewer({ lightbox: null, imgQuery: $(img), name: fileName, url: imgUrl, readMime: false }).then((pswp) => {
            /* pswp.on('close', () => {
                pswp.destroy();
                if (urlRevoke) window.URL.revokeObjectURL();
            }); */
        });
    };

    img.src = imgUrl;

};