import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { useRoutes } from './router';
import { Detail } from './detail';
import { Local } from './local';
import { MangaDataProvider } from './common/manga';
import { PointSizeProvider } from './common/point-size';
import { ViewportProvider } from './common/viewport';

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
];
const Loader = () => <div>Loading...</div>;

// const Entry = ({ routes }: { routes: RoutesConfig[] }) => {
//   const navigate = useNavigate();

//   return (
//     <div>
//       {routes
//         .filter((e) => !e.hide)
//         .map((e) => (
//           <button onClick={() => navigate(e.path)}>{e.dir || e.name}</button>
//         ))}
//     </div>
//   );
// };

const App = () => {
  const { routes } = useRoutes({
    routeConfigs,
    Loader,
  });

  return (
    <div className='App'>
      <MangaDataProvider>
        <PointSizeProvider>
          <ViewportProvider>
            <Router>
              <Routes>
                {routes.map((e) => (
                  <Route path={e.path} element={e.Component} />
                ))}
                <Route path='*' element={<Local />} />
              </Routes>
            </Router>
          </ViewportProvider>
        </PointSizeProvider>
      </MangaDataProvider>
    </div>
  );
};

export default App;
