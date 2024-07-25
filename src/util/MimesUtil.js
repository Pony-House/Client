export const imageMimes = ['image/png', 'image/gif', 'image/jpg', 'image/jpeg', 'image/webp'];

const imageExts = [];
for (const item in imageMimes) {
  imageExts.push(imageMimes[item].split('/')[1]);
}

export { imageExts };
