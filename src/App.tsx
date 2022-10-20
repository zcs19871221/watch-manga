import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { MangaDataProvider } from './provider/mangas';
import { ViewportProvider } from './provider/viewport';
import { MangaList } from './mangaList';
import { Scroll } from './scroll';

import 'antd/dist/antd.min.css';
import './App.css';

const App = () => {
  return (
    <div className='App'>
      <MangaDataProvider>
        <ViewportProvider>
          <Router>
            <Routes>
              <Route path='/detail/:mangaName/:type' element={<Scroll />} />
              <Route path='*' element={<MangaList />} />
            </Routes>
          </Router>
        </ViewportProvider>
      </MangaDataProvider>
    </div>
  );
};

export default App;
