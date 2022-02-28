# 使用条件

1. 必须使用 React 且 支持 Suspense 组件 React.lazyLoad api
2. webpack 需要支持 import() dynamic loading 护法

# api - 钩子

    import {useRoutes} from 'better-react-routes';
    import {DelUser} from './user/del';

    const { routes, menus } = useRoutes({
        // 菜单和路由配置树
        routeConfigs: [
          {
            // 导航地址，会添加上baseUrl和上一级的地址
            path: 'user',
            // 如果存在child，表明不是叶子结点，那么不能设置dir或Component属性
            child: [
              {
                // 对应导航为 /user/create
                path: 'create',
                // 权限和对应地址，会去寻找 /src/user/create/router-entry.tsx的文件的default导出 作为react-router的component，如果参数usedDirs是数组的话，只有dir存在与usedDirs里才会生成路有
                dir: 'user/create',
              },
              {
                // 对应导航为 /user/del
                path: 'del',
                // 表明是常驻路由组件，不涉及权限和动态加载
                Component: <DelUser />
              },
            ],
          },
        ],
        baseUrl: '/',
        // 异步加载时候的loader
        Loader: () => <div>Loading...</div>,
        // 如果传入数组，那么只会匹配数组中出现的对应dir
        // 这里不会创建del的组件和路由
        usedDirs: ['create'],
      });

# 路由 dir 对应的文件地址必须满足下面条件才能自动识别并加载

1. 必须在**src**目录下
2. 文件名必须是 **route-entry.tsx**
