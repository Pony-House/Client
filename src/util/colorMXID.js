// https://github.com/cloudrac3r/cadencegq/blob/master/pug/mxid.pug

export function hashCode(str) {
  let hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i += 1) {
    const chr = str.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + chr;
    // eslint-disable-next-line no-bitwise
    hash |= 0;
  }
  return Math.abs(hash);
}

export function cssColorMXID(userId) {
  const colorNumber = hashCode(userId) % 8;
  return `--mx-uc-${colorNumber + 1}`;
}

export function colorMXID(userId) {
  return `var(${cssColorMXID(userId)})`;
}

export function cssBackgroundColorMXID(userId) {
  const colorNumber = hashCode(userId) % 8;
  return `--mx-bg-${colorNumber + 1}`;
}

export function backgroundColorMXID(userId) {
  return `var(${cssBackgroundColorMXID(userId)})`;
}
