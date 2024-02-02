import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function InviteMessage({ user, inviter }) {
  return (
    <>
      <strong>{twemojifyReact(inviter)}</strong>
      {' invited '}
      <strong>{twemojifyReact(user)}</strong>
    </>
  );
}
