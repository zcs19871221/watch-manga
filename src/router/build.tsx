import React from 'react';
import { RouteComponent } from './dynamic-import';

interface BuildOptions {
  routeConfigs: MenuConfig[];
  baseUrl?: string;
  usedDirs?: string[];
  Loader?: () => JSX.Element;
}

type MenuConfig = (
  | {
      child: MenuConfig[];
      dir?: undefined;
    }
  | {
      dir: string;
      Component?: undefined;
      hide?: boolean;
      child?: undefined;
    }
  | {
      dir?: undefined;
      Component: JSX.Element;
      hide?: boolean;
      child?: undefined;
    }
) & {
  path: string;
  name?: string;
};

interface RoutesConfig {
  path: string;
  Component: JSX.Element;
  dir?: string;
  hide?: boolean;
  name?: string;
}
export type { MenuConfig, BuildOptions, RoutesConfig };

export const build = ({
  routeConfigs,
  baseUrl = '/',
  usedDirs,
  existedUrls = [],
  existedDirs = [],
  routes = [],
  Loader,
}: BuildOptions & {
  existedUrls?: string[];
  existedDirs?: string[];
  routes?: RoutesConfig[];
}): [MenuConfig[], RoutesConfig[]] => {
  const filterdTree = routeConfigs.reduce((acc: MenuConfig[], r) => {
    const url = `${baseUrl}/${r.path}`.replace(/\/+/gu, '/');
    if (existedUrls.includes(url)) {
      throw new Error(`重复url:${url} path:${r.path}`);
    }
    if (r.dir && existedDirs.includes(r.dir)) {
      throw new Error(`dir不唯一:${r.dir}`);
    }
    existedUrls.push(url);
    let curRoutes: MenuConfig[] = [];
    if (!r.child) {
      if (r.dir) {
        if (!usedDirs || usedDirs.includes(r.dir)) {
          routes.push({
            dir: r.dir,
            Component: RouteComponent(r.dir, Loader),
            path: url,
            hide: r.hide,
            name: r.name,
          });
        }
        curRoutes = [{ ...r, path: url }];
        existedDirs.push(r.dir);
      } else if (r.Component) {
        routes.push({
          dir: r.dir,
          Component: r.Component,
          path: url,
          hide: r.hide,
          name: r.name,
        });
        curRoutes = [{ ...r, path: url }];
      }
    } else {
      const [child] = build({
        routeConfigs: r.child,
        baseUrl: url,
        usedDirs,
        existedDirs,
        existedUrls,
        routes,
      });
      if (child.length > 0) {
        curRoutes = [{ ...r, path: url, child }];
      }
    }
    acc.push(...curRoutes);
    return acc;
  }, []);

  return [filterdTree, routes];
};
