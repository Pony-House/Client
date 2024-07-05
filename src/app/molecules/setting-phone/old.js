const filteredContent = oldValue.replace(/\D+/g, (text) => {
  if (text === ' ') return text;
  else return '';
});
