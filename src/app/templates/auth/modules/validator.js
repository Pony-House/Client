export function isValidInput(value, regex) {
  if (typeof regex === 'string') return regex === value;
  return regex.test(value);
}

export function normalizeUsername(rawUsername) {
  const noLeadingAt = rawUsername.indexOf('@') === 0 ? rawUsername.substr(1) : rawUsername;
  return noLeadingAt.trim();
}
