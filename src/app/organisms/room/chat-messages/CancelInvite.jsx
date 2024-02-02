import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function CancelInviteMessage({ user, inviter }) {
  return (
    <>
      <strong>{twemojifyReact(inviter)}</strong>
      {' canceled '}
      <strong>{twemojifyReact(user)}</strong>
      {"'s invite"}
    </>
  );
}
