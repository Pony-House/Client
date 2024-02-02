import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function RejectInviteMessage({ user }) {
  return (
    <>
      <strong>{twemojifyReact(user)}</strong>
      {' rejected the invitation'}
    </>
  );
}
