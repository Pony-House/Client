import { getFileContentType } from '../../../util/fileMime';

const ImageBrokenSVG = './img/svg/image-broken.svg';

// Await Avatar Load
export function waitAvatarLoad(img) {
  return new Promise((resolve) => {
    if (img) {
      if (img.attr('loadingimg') !== 'true') {
        resolve(true);
      } else {
        setTimeout(() => waitAvatarLoad().then(resolve), 100);
      }
    } else {
      resolve(false);
    }
  });
}

// Update Avatar Data
export function updateAvatarData(img, normalImg, animateImg, defaultavatar) {
  img.attr('loadingimg', 'true');
  return new Promise((resolve, reject) => {
    if (img) {
      // Update Src
      if (animateImg !== null) img.attr('src', animateImg).data('avatars-animate', animateImg);
      else if (normalImg !== null) img.attr('src', normalImg).data('avatars-normal', normalImg);
      else if (defaultavatar !== null) img.data('avatars-default', defaultavatar);

      // Remove OLD Avatar
      img.attr('src', img.data('avatars-default'));

      // Get Data
      getFileContentType({ target: img.get(0) }, img.data('avatars-animate'))
        .then((data) => {
          // Set Data Prepare
          img.attr('loadingimg', 'true');

          // Read File Type
          if (
            Array.isArray(data.type) &&
            typeof data.type[0] === 'string' &&
            typeof data.type[1] === 'string'
          ) {
            if (data.type[0] === 'image') {
              // Change Avatar Type
              img.data('avatars-type', data.type[1]);

              // Set Normal Image
              img.attr('src', img.data('avatars-normal'));
              img.attr('loadingimg', 'false');

              // Complete
              resolve(true);

              // Invalid values here
            } else {
              img.attr('src', ImageBrokenSVG);
              img.attr('loadingimg', 'false');
              resolve(false);
            }
          } else {
            img.attr('src', ImageBrokenSVG);
            img.attr('loadingimg', 'false');
            resolve(false);
          }
        })

        // Fail
        .catch((err) => {
          img.attr('src', ImageBrokenSVG);
          img.attr('loadingimg', 'false');
          reject(err);
        });
    } else {
      resolve(false);
    }
  });
}

// Install Avatar Data
export function installAvatarData(img) {
  img.attr('loadingimg', 'true');
  return new Promise((resolve, reject) => {
    if (img) {
      // Load Type Data
      getFileContentType({ target: img.get(0) }, img.data('avatars-animate'))
        .then((data) => {
          // Set background e prepare data validator
          img.attr('loadingimg', 'true');
          img.css('background-color', 'transparent');

          // Read File Type
          if (
            Array.isArray(data.type) &&
            typeof data.type[0] === 'string' &&
            typeof data.type[1] === 'string'
          ) {
            if (data.type[0] === 'image') {
              // Gif Detected
              img.data('avatars-type', data.type[1]);

              // Prepare Node Detector
              let tinyNode = img.get(0);
              if (tinyNode) {
                for (let i = 0; i < img.data('avatars-parents'); i++) {
                  if (tinyNode) {
                    tinyNode = tinyNode.parentNode;
                  } else {
                    break;
                  }
                }

                if (tinyNode) {
                  // Final Node
                  tinyNode = $(tinyNode);

                  // Insert Effects
                  tinyNode.hover(
                    () => {
                      if (img.data('avatars-type') === 'gif' && img.data('avatars-animate'))
                        img.attr('src', img.data('avatars-animate'));
                    },
                    () => {
                      if (img.data('avatars-type') === 'gif' && img.data('avatars-normal'))
                        img.attr('src', img.data('avatars-normal'));
                    },
                  );

                  // Set Normal Image
                  img.attr('src', img.data('avatars-normal'));
                  img.attr('loadingimg', 'false');

                  // Complete
                  resolve(true);
                } else {
                  resolve(false);
                }
              } else {
                resolve(false);
              }

              // Invalid values here
            } else {
              img.attr('src', ImageBrokenSVG);
              img.attr('loadingimg', 'false');
              resolve(false);
            }
          } else {
            img.attr('src', ImageBrokenSVG);
            img.attr('loadingimg', 'false');
            resolve(false);
          }
        })

        // Fail
        .catch((err) => {
          img.attr('src', ImageBrokenSVG);
          img.attr('loadingimg', 'false');
          reject(err);
        });
    } else {
      resolve(false);
    }
  });
}

// Load Avatar tags
export function loadAvatarTags(e) {
  const img = $(e.target);
  img.attr('loadingimg', 'true');
  return new Promise((resolve, reject) => {
    if (img) {
      // Get Params
      const avatars = {
        parents: Number(img.attr('animparentscount')),
        animate: img.attr('animsrc'),
        normal: img.attr('normalsrc'),
      };

      // Insert Params
      img.data('avatars-animate', avatars.animate);
      img.data('avatars-normal', avatars.normal);
      img.data('avatars-default', img.attr('defaultavatar'));

      // Delete Tags
      img.removeAttr('animsrc');
      img.removeAttr('animparentscount');
      img.removeAttr('normalsrc');
      img.removeAttr('defaultavatar');

      // Fix Parents Param
      if (
        Number.isNaN(avatars.parents) ||
        !Number.isFinite(avatars.parents) ||
        avatars.parents < 0 ||
        avatars.parents > 20
      )
        avatars.parents = 0;
      img.data('avatars-parents', avatars.parents);

      // Update Src
      if (avatars.animate !== null) img.attr('src', avatars.animate);
      else if (avatars.normal !== null) img.attr('src', avatars.normal);

      // Load Data
      installAvatarData(img)
        .then(() => resolve(img))
        .catch(reject);
    } else {
      resolve(null);
    }
  });
}

// Load Avatar
export function loadAvatar(e) {
  const avatar = $(e.target);
  if (avatar.attr('loadedimg') === 'false') {
    avatar.removeAttr('loadedimg');
    waitAvatarLoad(avatar).then((solved) => {
      if (solved) loadAvatarTags(e);
    });
  }
}

// Force Reload
export function forceLoadAvatars() {
  $('.avatar-react[loadedimg="false"]').each((index, target) => {
    const img = $(target);
    waitAvatarLoad(img).then((solved) => {
      if (solved) loadAvatar({ target });
    });
  });
}

export function forceUnloadedAvatars() {
  $('.avatar-react[animsrc], .avatar-react[normalsrc], .avatar-react[defaultavatar]').each(
    (index, target) => {
      const img = $(target);

      const normalImg = img.attr('normalsrc');
      const animateImg = img.attr('animsrc');
      const defaultavatar = img.attr('defaultavatar');

      img.removeAttr('animsrc');
      img.removeAttr('animparentscount');
      img.removeAttr('normalsrc');
      img.removeAttr('defaultavatar');

      waitAvatarLoad(img).then((solved) => {
        if (solved) updateAvatarData(img, normalImg, animateImg, defaultavatar);
      });
    },
  );
}
