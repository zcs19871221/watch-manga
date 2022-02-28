import React, { Suspense } from 'react';

export const RouteComponent = (dir: string, Loader?: () => JSX.Element) => {
  const Component = React.lazy(
    () =>
      import(
        /* webpackChunkName: "chunk-[request]" */
        `/src/${dir}/route-entry.tsx`
      ),
  );
  return (
    <Suspense fallback={Loader ? <Loader /> : <div>loading...</div>}>
      <Component />
    </Suspense>
  );
};
