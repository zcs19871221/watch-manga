import React, { useMemo, useState, createContext, useContext } from 'react';

const keys = ['list'] as const;

export type OffsetKeys = typeof keys[number];
type ContextType = {
  [key in OffsetKeys]: [number, (num: number) => void];
};
const OffsetContext = createContext<ContextType>({
  list: [0, () => {}],
});

export const Offsetrovider = ({ children }: { children: any }) => {
  const [data, setData] = useState<{
    [key in OffsetKeys]: number;
  }>({ list: 0 });

  const value = useMemo(() => {
    const map: ContextType = {} as ContextType;
    keys.forEach((key) => {
      map[key] = [
        data[key],
        (value: number) => {
          setData((prev) => ({
            ...prev,
            [key]: value,
          }));
        },
      ];
    });
    return map;
  }, [data]);
  return (
    <OffsetContext.Provider value={value}>{children}</OffsetContext.Provider>
  );
};

export const useOffset = (key: OffsetKeys) => useContext(OffsetContext)[key];
