/* eslint-disable no-multi-assign */
/* eslint-disable no-bitwise */

// https://www.npmjs.com/package/rainbow-colors-array
export function rgbToHex(r, g, b) {
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export function rgbToHsl(gr, gg, gb) {

  let r = gr;
  let g = gg;
  let b = gb;

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return { "h": h, "s": s, "l": l };

};

export function rca(len, type, pastel) {

  let eq1 = 127;
  let eq2 = 128;
  if (len === undefined) { len = 24 };
  if (type === undefined) { type = "rgb" };
  if (pastel === true) { eq1 = 55; eq2 = 200 };
  const frequency = Math.PI * 2 / len;

  const cvparr = [];
  for (let i = 0; i < len; ++i) {

    const red = Math.sin(frequency * i + 2) * eq1 + eq2;
    const green = Math.sin(frequency * i + 0) * eq1 + eq2;
    const blue = Math.sin(frequency * i + 4) * eq1 + eq2;

    switch (type) {
      case "hex":
        cvparr.push({ "hex": rgbToHex(Math.round(red), Math.round(green), Math.round(blue)) });
        break;
      case "rgb":
        cvparr.push({ "r": red, "g": green, "b": blue });
        break;
      case "hsl":
        cvparr.push(rgbToHsl(Math.round(red), Math.round(green), Math.round(blue)));
        break;
    }

  }

  return cvparr;

};

export function randomColor() {
  return `#${(0x1000000 + Math.random() * 0xffffff).toString(16).substring(1, 6)}`;
};

export default function rainbowText(value, amount = 24) {

  const rainbowData = rca(amount, 'hex');

  let color = 0;
  let text = '';
  for (let i = 0; i < value.length; i++) {
    if (!rainbowData[color]) color = 0;
    text += `<font color="#${rainbowData[color].hex}">${value[i]}</font>`;
    color++;
  }

  return text;

};