const tinyCache = {
  count: 0,
  // queue: [],
};

setInterval(() => {
  if (tinyCache.count > 1) tinyCache.count--;
}, 1000);

export function insertEvent(callback) {
  tinyCache.count++;
  setTimeout(() => callback(), 10 * tinyCache.count);
}
