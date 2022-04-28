import React, { useMemo, useState, createContext, useContext } from 'react';

const keys = ['list'] as const;

export type OffsetKeys = typeof keys[number];
type ContextType = {
  [key in OffsetKeys]: [
    { offset: number; scrollTop: number },
    ({ offset, scrollTop }: { offset?: number; scrollTop?: number }) => void,
  ];
};
const OffsetContext = createContext<ContextType>({
  list: [{ offset: 0, scrollTop: 0 }, () => {}],
});

export const OffsetProvider = ({ children }: { children: any }) => {
  const [data, setData] = useState<{
    [key in OffsetKeys]: {
      offset: number;
      scrollTop: number;
    };
  }>({
    list: {
      offset: 0,
      scrollTop: 0,
    },
  });

  const value = useMemo(() => {
    const map: ContextType = {} as ContextType;
    keys.forEach((key) => {
      map[key] = [
        data[key],
        ({ offset, scrollTop }: { offset?: number; scrollTop?: number }) => {
          setData((prev) => {
            prev[key] = {
              ...prev[key],
              ...(scrollTop !== undefined && {
                scrollTop,
              }),
              ...(offset !== undefined && {
                offset,
              }),
            };
            return { ...prev };
          });
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
