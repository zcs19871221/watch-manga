import React from 'react';

import { Feature } from './feature';
import { useMode } from '../mode-context';
import { ReactComponent as LeftArrow } from './assets/left-arrow.svg';
import { ReactComponent as RightArrow } from './assets/right-arrow.svg';
import { ReactComponent as DownArrow } from './assets/down-arrow.svg';

const modes = [
  { name: '滚动', key: 'Scroll', Icon: DownArrow },
  { name: '普通', key: 'Book', Icon: RightArrow },
  { name: '日漫', key: 'Manga', Icon: LeftArrow },
] as const;

export const ModeSwitch = () => {
  const [mode, setMode] = useMode();

  return (
    <>
      {modes.map((e) => (
        <Feature
          {...e}
          isClicked={mode === e.key}
          onClick={() => {
            setMode(e.key);
          }}
        />
      ))}
    </>
  );
};
