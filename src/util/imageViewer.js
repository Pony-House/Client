import FileSaver from 'file-saver';
import PhotoSwipeLightbox from 'photoswipe';

export default async function imageViewer(lightbox, imgQuery, name, url) {
    try {

        // Read Image Tag
        const img = imgQuery.get(0);
        if (img) {

            // Prepare Data
            const imgData = { height: null, width: null };
            if (typeof img.naturalWidth === 'number' && typeof img.naturalHeight === 'number') {
                imgData.height = img.naturalHeight;
                imgData.width = img.naturalWidth;
            }

            // Create Lightbox
            const pswp = new PhotoSwipeLightbox({
                dataSource: [
                    {
                        src: url,
                        alt: name,
                        width: imgData.width,
                        height: imgData.height,
                    },
                ],
                padding: { top: 40, bottom: 40, left: 100, right: 100 },
            });

            // Register Buttons
            pswp.on('uiRegister', () => {
                pswp.ui.registerElement({
                    name: 'new-window-button',
                    ariaLabel: 'Open Url',
                    order: 9,
                    isButton: true,
                    html: '<i class="fa-solid fa-arrow-up-right-from-square pswp__icn" height="32" width="32"></i>',
                    onClick: () => {
                        window.open(url, '_blank').focus();
                    }
                });
                pswp.ui.registerElement({
                    name: 'download-button',
                    ariaLabel: 'Download Image',
                    order: 10,
                    isButton: true,
                    html: '<i class="fa-solid fa-floppy-disk pswp__icn" height="32" width="32"></i>',
                    onClick: () => {
                        FileSaver.saveAs(url, name);
                    }
                });
            });

            // Init lightbox now
            pswp.init();
            if (lightbox && lightbox.loadAndOpen) lightbox.loadAndOpen(0);

        }

    } catch (err) { console.error(err); alert(err.message); }
};