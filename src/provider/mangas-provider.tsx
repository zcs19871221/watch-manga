import { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { Manga, fetchMangas } from '../service/fetch-interface';

const useInitData = () => {
  const [mgs, setMgs] = useState<Manga[]>([]);

  const reload = () => {
    (async function () {
      setMgs(await fetchMangas());
    })();
  };

  useEffect(() => {
    reload();
  }, []);

  return useMemo(() => {
    const getManga = (mangaName: string) => {
      return mgs.find((e) => e.name === mangaName);
    };

    return [
      { mgs },
      {
        getManga,
        reload,
      },
    ] as const;
  }, [mgs]);
};
const MangaContext = createContext<ReturnType<typeof useInitData>>([
  { mgs: [] },
  {
    getManga: () => undefined,
    reload: () => {},
  },
]);

export function MangaDataProvider({ children }: { children: any }) {
  const value = useInitData();

  return (
    <MangaContext.Provider value={value}>{children}</MangaContext.Provider>
  );
}

export const useMangaData = () => useContext(MangaContext);
