import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useContext,
} from 'react';
import { Manga, fetchMangas } from './fetch-interface';

type MangaContextValue = [
  { mgs: Manga[] },
  {
    getManga: (name: string) => Manga | null;
    reload: () => void;
  },
];

const MangaContext = createContext<MangaContextValue>([
  { mgs: [] },
  {
    getManga: () => null,
    reload: () => {},
  },
]);

export function MangaDataProvider({ children }: { children: any }) {
  const [mgs, setMgs] = useState<Manga[]>([]);

  const reload = () => {
    (async function () {
      setMgs(await fetchMangas());
    })();
  };

  useEffect(() => {
    reload();
  }, []);

  const value = useMemo<MangaContextValue>(() => {
    const getManga = (mangaName: string): Manga | null => {
      return mgs.find((e) => e.name === mangaName) || null;
    };

    return [
      { mgs },
      {
        getManga,
        reload,
      },
    ];
  }, [mgs]);

  return (
    <MangaContext.Provider value={value}>{children}</MangaContext.Provider>
  );
}

export const useMangaDatas = () => useContext(MangaContext);
