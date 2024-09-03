const tinyInfo = { default: 'bi bi-file-earmark' };

tinyInfo.types = {
  image: 'bi bi-file-earmark-image',
  audio: 'bi bi-file-earmark-music',
  video: 'bi bi-file-earmark-play',
};

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
tinyInfo.fullType = {
  'image/svg+xml': 'bi bi-filetype-svg',
  'image/svg': 'bi bi-filetype-svg',
  'application/x-font-ttf': 'bi bi-file-earmark-font',
  'application/x-font-truetype': 'bi bi-file-earmark-font',
  'application/x-font-opentype': 'bi bi-file-earmark-font',
  'application/font-woff': 'bi bi-file-earmark-font',
  'application/font-woff2': 'bi bi-file-earmark-font',
  'application/vnd.ms-fontobject': 'bi bi-file-earmark-font',
  'application/font-sfnt': 'bi bi-file-earmark-font',
  'text/css': 'bi bi-file-earmark-code',
  'text/csv': 'bi bi-file-earmark-code',
  'application/msword': 'bi bi-file-earmark-word',
  'application/gzip': 'bi bi-file-earmark-zip',
  'application/x-gzip': 'bi bi-file-earmark-zip',
  'text/html': 'bi bi-file-earmark-code',
  'text/javascript': 'bi bi-file-earmark-code',
  'application/json': 'bi bi-file-earmark-code',
  'application/ld+json': 'bi bi-file-earmark-code',
  'application/pdf': 'bi bi-file-earmark-pdf',
  'application/x-httpd-php': 'bi bi-file-earmark-code',
  'application/vnd.rar': 'bi bi-file-earmark-zip',
  'application/x-sh': 'bi bi-file-earmark-code',
  'application/x-tar': 'bi bi-file-earmark-zip',
  'application/xhtml+xml': 'bi bi-file-earmark-code',
  'application/xml': 'bi bi-file-earmark-code',
  'text/xml': 'bi bi-file-earmark-code',
  'application/atom+xml': 'bi bi-file-earmark-code',
  'application/zip': 'bi bi-file-earmark-zip',
  'application/x-7z-compressed': 'bi bi-file-earmark-zip',
  'application/vnd.apple.installer+xml': '',
  'application/ogg': 'bi bi-file-earmark-music',
};

tinyInfo.extTypes = {
  aac: 'bi bi-filetype-aac',
  ai: 'bi bi-filetype-ai',
  bmp: 'bi bi-filetype-bmp',
  cs: 'bi bi-filetype-cs',
  css: 'bi bi-filetype-css',
  csv: 'bi bi-filetype-csv',
  doc: 'bi bi-filetype-doc',
  docx: 'bi bi-filetype-docx',
  exe: 'bi bi-filetype-exe',
  gif: 'bi bi-filetype-gif',
  heic: 'bi bi-filetype-heic',
  html: 'bi bi-filetype-html',
  java: 'bi bi-filetype-java',
  jpg: 'bi bi-filetype-jpg',
  js: 'bi bi-filetype-js',
  json: 'bi bi-filetype-json',
  jsx: 'bi bi-filetype-jsx',
  key: 'bi bi-filetype-key',
  m4p: 'bi bi-filetype-m4p',
  md: 'bi bi-filetype-md',
  mdx: 'bi bi-filetype-mdx',
  mov: 'bi bi-filetype-mov',
  mp3: 'bi bi-filetype-mp3',
  mp4: 'bi bi-filetype-mp4',
  otf: 'bi bi-filetype-otf',
  pdf: 'bi bi-filetype-pdf',
  php: 'bi bi-filetype-php',
  png: 'bi bi-filetype-png',
  ppt: 'bi bi-filetype-ppt',
  pptx: 'bi bi-filetype-pptx',
  psd: 'bi bi-filetype-psd',
  py: 'bi bi-filetype-py',
  raw: 'bi bi-filetype-raw',
  rb: 'bi bi-filetype-rb',
  sass: 'bi bi-filetype-sass',
  scss: 'bi bi-filetype-scss',
  sh: 'bi bi-filetype-sh',
  sql: 'bi bi-filetype-sql',
  svg: 'bi bi-filetype-svg',
  tiff: 'bi bi-filetype-tiff',
  tsx: 'bi bi-filetype-tsx',
  ttf: 'bi bi-filetype-ttf',
  txt: 'bi bi-filetype-txt',
  wav: 'bi bi-filetype-wav',
  woff: 'bi bi-filetype-woff',
  xls: 'bi bi-filetype-xls',
  xlsx: 'bi bi-filetype-xlsx',
  xml: 'bi bi-filetype-xml',
  yml: 'bi bi-filetype-yml',
  svg: 'bi bi-filetype-svg',
};

const getExtIcon = (ext = '') => {
  if (typeof tinyInfo.extTypes[ext] === 'string') return tinyInfo.extTypes[ext];
  return tinyInfo.default;
};

const getFileIcon = (mime = '', filename = '') => {
  if (typeof tinyInfo.fullType[mime] === 'string') return tinyInfo.fullType[mime];

  const mimeData = mime.split('/');
  if (typeof tinyInfo.types[mimeData[0]] === 'string') return tinyInfo.types[mimeData[0]];

  const fileName = filename.split('.');
  return getExtIcon(fileName[fileName.length - 1]);
};

export { getFileIcon, getExtIcon };
