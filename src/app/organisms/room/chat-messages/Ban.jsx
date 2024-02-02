import React from 'react';
import { twemojifyReact } from '../../../../util/twemojify';

export default function BanMessage({ user, actor, reason }) {
  const reasonMsg = typeof reason === 'string' ? `: ${reason}` : '';

  return (
    <>
      <strong>{twemojifyReact(actor)}</strong>
      {' banned '}
      <strong>{twemojifyReact(user)}</strong>
      {twemojifyReact(reasonMsg)}
    </>
  );
}
