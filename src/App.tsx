import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { useRoutes } from './router';
import { Detail } from './detail';
import { Local } from './local';
import { MangaDataProvider } from './service/mangas-provider';
import { ViewportProvider } from './common/viewport';
import { OffsetProvider } from './common/offset';

import './App.css';

const routeConfigs = [
  {
    path: 'd',
    Component: <Detail />,
    hide: true,
  },
  {
    path: 'l',
    Component: <Local />,
    name: '本地',
  },
  {
    path: 'search',
    Component: <Local />,
    name: '测试',
  },
];
const Loader = () => <div>Loading...</div>;

const App = () => {
  const { routes } = useRoutes({
    routeConfigs,
    Loader,
  });

  return (
    <div className='App'>
      <MangaDataProvider>
        <ViewportProvider>
          <OffsetProvider>
            <Router>
              <Routes>
                {routes.map((e) => (
                  <Route path={e.path} element={e.Component} />
                ))}
                <Route path='*' element={<Local />} />
              </Routes>
            </Router>
          </OffsetProvider>
        </ViewportProvider>
      </MangaDataProvider>
    </div>
  );
};

export default App;
