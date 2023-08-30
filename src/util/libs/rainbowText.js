export default function rainbowText(value) {

  let text = '';
  for (let i = 0; i < value.length; i++) {
    text += `<font color="hsl(${Number(360 * i / value.length)},80%,50%)">${value[i]}</font>`;
  }

  return text;

};