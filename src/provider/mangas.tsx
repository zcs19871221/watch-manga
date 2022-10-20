import { createContext, useState, useEffect, useMemo, useContext } from 'react';
import { Manga, fetchMangas, Page } from '../service/fetch-interface';

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
    const getPages = (mangaName: string, type: 'volumes' | 'chapters') => {
      const manga = mgs.find((e) => e.name === mangaName);
      if (manga) {
        const pages = manga[type].reduce((acc, cur) => {
          acc.push(...cur.pages);
          return acc;
        }, [] as Page[]);
        return pages;
      }
      return null;
    };

    return { mgs, getPages, reload } as const;
  }, [mgs]);
};
const MangaContext = createContext<ReturnType<typeof useInitData>>({
  mgs: [],
  getPages: () => null,
  reload: () => {},
});

export function MangaDataProvider({ children }: { children: any }) {
  const value = useInitData();

  return (
    <MangaContext.Provider value={value}>{children}</MangaContext.Provider>
  );
}

export const useMangaData = () => useContext(MangaContext);
