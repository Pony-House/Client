import React, { lazy, Suspense } from 'react';

const Math = lazy(() => import('../../../app/atoms/math/Math'));
export default function MxMaths({ displayMode, maths }) {
  return (
    <Suspense fallback={<code>{maths}</code>}>
      <Math
        content={maths}
        throwOnError={false}
        errorColor="var(--tc-danger-normal)"
        displayMode={displayMode === 'div'}
      />
    </Suspense>
  );
}
