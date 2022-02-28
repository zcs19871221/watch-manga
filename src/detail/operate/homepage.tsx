import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { Feature } from './feature';
import { ReactComponent as HomePageIcon } from './assets/homepage.svg';

export const HomePage = () => {
  const navigate = useNavigate();

  const jumpTo = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <Feature
      isClicked={false}
      onClick={jumpTo}
      name='主页'
      Icon={HomePageIcon}
    />
  );
};
