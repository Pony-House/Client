export const imageMimes = [
  'image/png',
  'image/gif',
  'image/jpg',
  'image/jpeg',
  'image/webp',
  'image/apng',
  'image/avif',
  'image/bmp',
  'image/tiff',
];

const imageExts = [];
for (const item in imageMimes) {
  imageExts.push(imageMimes[item].split('/')[1]);
}

export { imageExts };
