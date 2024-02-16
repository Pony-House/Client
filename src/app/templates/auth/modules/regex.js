const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const BAD_EMAIL_ERROR = 'Invalid email address';

const PASSWORD_STRENGHT_REGEX = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,127}$/;
const BAD_PASSWORD_ERROR =
  'Password must contain at least 1 lowercase, 1 uppercase, 1 number, 1 non-alphanumeric character, 8-127 characters with no space.';
const CONFIRM_PASSWORD_ERROR = "Passwords don't match.";

export {
  EMAIL_REGEX,
  BAD_EMAIL_ERROR,
  PASSWORD_STRENGHT_REGEX,
  BAD_PASSWORD_ERROR,
  CONFIRM_PASSWORD_ERROR,
};
