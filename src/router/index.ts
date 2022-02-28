import React, { useMemo } from 'react';
import { build, MenuConfig, BuildOptions, RoutesConfig } from './build';

export const useRoutes = ({
  routeConfigs,
  baseUrl,
  usedDirs,
  Loader,
}: BuildOptions & { Loader?: () => JSX.Element }) => {
  return useMemo(() => {
    const [menus, routes] = build({ routeConfigs, baseUrl, usedDirs, Loader });
    return {
      routes,
      menus,
    };
  }, [baseUrl, routeConfigs, usedDirs, Loader]);
};

export type { RoutesConfig, MenuConfig };
