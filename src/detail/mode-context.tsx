import React, { createContext, useContext, useState, useMemo } from 'react';

const ModeValus = ['Scroll', 'Book', 'Manga'] as const;

export type Mode = typeof ModeValus[number];

type ModeContextValue = [Mode, (mode: Mode) => void];
const ModeContext = createContext<ModeContextValue>(['Scroll', () => {}]);

export const ModeProvider = ({ children }: { children: any }) => {
  let initMode = localStorage.getItem('mode') as Mode | null;
  if (!initMode || !ModeValus.includes(initMode)) {
    initMode = 'Scroll';
  }
  const [mode, setMode] = useState<Mode>(initMode);

  const value = useMemo(() => {
    const recordMode = (mode: Mode) => {
      localStorage.setItem('mode', mode);
      setMode(mode);
    };
    return [mode, recordMode] as ModeContextValue;
  }, [mode]);
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
};

export const ModeConsumter = ({
  children,
}: {
  children: (mode: Mode) => React.ReactNode;
}) => {
  return (
    <ModeContext.Consumer>{(mode) => children(mode[0])}</ModeContext.Consumer>
  );
};

export const useMode = () => {
  return useContext(ModeContext);
};
