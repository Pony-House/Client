import parsePhoneNumber from 'libphonenumber-js';

import {
  EMAIL_REGEX,
  BAD_EMAIL_ERROR,
  PASSWORD_STRENGHT_REGEX,
  BAD_PASSWORD_ERROR,
  CONFIRM_PASSWORD_ERROR,
} from './regex';
import { isValidInput } from './validator';

export const LOCALPART_SIGNUP_REGEX = /^[a-z0-9_\-.=/]+$/;
export const BAD_LOCALPART_ERROR = "Username can only contain characters a-z, 0-9, or '=_-./'";
export const USER_ID_TOO_LONG_ERROR =
  "Your user ID, including the hostname, can't be more than 255 characters long.";
export const BAD_PHONE_ERROR = 'You are typing an invalid phone number format.';

export const registerValidator = (values) => {
  const errors = {};

  // Default register inputs
  if (values.username.list > 255) errors.username = USER_ID_TOO_LONG_ERROR;
  if (values.username.length > 0 && !isValidInput(values.username, LOCALPART_SIGNUP_REGEX)) {
    errors.username = BAD_LOCALPART_ERROR;
  }

  if (values.password.length > 0 && !isValidInput(values.password, PASSWORD_STRENGHT_REGEX)) {
    errors.password = BAD_PASSWORD_ERROR;
  }

  if (values.confirmPassword.length > 0 && !isValidInput(values.confirmPassword, values.password)) {
    errors.confirmPassword = CONFIRM_PASSWORD_ERROR;
  }

  if (values.email.length > 0 && !isValidInput(values.email, EMAIL_REGEX)) {
    errors.email = BAD_EMAIL_ERROR;
  }

  // Extra inputs
  if (typeof values.phone === 'string' && values.phone.length > 0) {
    try {
      const phoneNumber = parsePhoneNumber(values.phone);

      if (!phoneNumber || !phoneNumber.isPossible() || !phoneNumber.isValid()) {
        errors.phone = BAD_PHONE_ERROR;
      }
    } catch {
      errors.phone = BAD_PHONE_ERROR;
    }
  }

  return errors;
};
