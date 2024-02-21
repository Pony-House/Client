import FileSaver from 'file-saver';
import PhotoSwipeLightbox from 'photoswipe';
import { getFileContentType } from './fileMime';
import { toast } from './tools';

export default function imageViewer(data) {
  return new Promise(async (resolve, reject) => {
    try {
      // Read Image Tag
      const img = data.imgQuery.get(0);
      if (img) {
        // Get Mime
        let filename = data.name;
        let tinyImgData = null;
        if (data.readMime) {
          try {
            // Read Mime
            tinyImgData = await getFileContentType({ target: img }, data.url);

            // Insert Mime
            if (
              Array.isArray(tinyImgData.type) &&
              tinyImgData.type.length > 1 &&
              typeof tinyImgData.type[1] === 'string'
            ) {
              filename += `.${tinyImgData.type[1]}`;
            }
          } catch (err) {
            console.error(err);
            tinyImgData = null;
          }
        }

        // Prepare Data
        const imgData = { height: null, width: null };
        if (typeof img.naturalWidth === 'number' && typeof img.naturalHeight === 'number') {
          imgData.height = img.naturalHeight;
          imgData.width = img.naturalWidth;
        }

        // Get Data
        else if (tinyImgData) {
          imgData.height = tinyImgData.height;
          imgData.width = tinyImgData.width;
        }

        // Create Lightbox
        const pswp = new PhotoSwipeLightbox({
          dataSource: [
            {
              src: data.url,
              alt: filename,
              width: imgData.width,
              height: imgData.height,
            },
          ],
          padding: { top: 40, bottom: 40, left: 100, right: 100 },
        });

        // Register Buttons
        pswp.on('uiRegister', () => {
          if (!__ENV_APP__.ELECTRON_MODE) {
            pswp.ui.registerElement({
              name: 'new-window-button',
              ariaLabel: 'Open Url',
              order: 9,
              isButton: true,
              html: '<i class="fa-solid fa-arrow-up-right-from-square pswp__icn" height="32" width="32"></i>',
              onClick: () => {
                window.open(data.url, '_blank').focus();
              },
            });
          }

          pswp.ui.registerElement({
            name: 'download-button',
            ariaLabel: 'Download Image',
            order: 10,
            isButton: true,
            html: '<i class="fa-solid fa-floppy-disk pswp__icn" height="32" width="32"></i>',
            onClick: () => {
              FileSaver.saveAs(data.url, filename);
            },
          });
        });

        // Init lightbox now
        resolve(pswp);

        pswp.init();
        if (data.lightbox && data.lightbox.loadAndOpen) data.lightbox.loadAndOpen(0);
      }
    } catch (err) {
      console.error(err);
      toast(err.message);
      reject(err);
    }
  });
}
