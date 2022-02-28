import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useContext,
} from 'react';
import {
  Manga,
  fetchMangas,
  fetchReadPoint,
  ReadPoint,
  saveReadPoint,
  fetchBase,
  Volume,
} from './fetch-interface';

export type { Manga, ReadPoint } from './fetch-interface';

export interface ImgPoint extends ReadPoint {
  src: string;
}

type MangaContextValue = [
  { mgs: Manga[] },
  {
    getManga: (name: string) => Manga | null;
    reload: () => void;
    getTotalNum: (manga: string | Manga) => number;
    getReadPoint: (mangaName: string) => Promise<ReadPoint>;
    writeReadPoint: (readPoint: ReadPoint) => Promise<void>;
    getImgSrc: (readPoint: ReadPoint) => string;
    getPointOffSet: (readPoint: ReadPoint) => number;
    advanceTrack: (readPoint: ReadPoint) => ReadPoint | null;
    backTrack: (readPoint: ReadPoint) => ReadPoint | null;
    isEqual: (a: ReadPoint | null, b: ReadPoint | null) => boolean;
    getKey: (a: ReadPoint) => string;
    advanceTrackPoints: (
      rp: ReadPoint,
      count: number,
      onEach?: (point: ReadPoint) => any,
    ) => ReadPoint[];
    backTrackPoints: (
      rp: ReadPoint,
      count: number,
      onEach?: (point: ReadPoint) => any,
    ) => ReadPoint[];
    isFirstPoint: (rp: ReadPoint) => boolean;
    isLastPoint: (rp: ReadPoint) => boolean;
  },
];
const MangaContext = createContext<MangaContextValue>([
  { mgs: [] },
  {
    getManga: () => null,
    reload: () => {},
    backTrack: () => null,
    advanceTrack: () => null,
    getTotalNum: () => 0,
    getPointOffSet: () => 0,
    getReadPoint: async () => {
      return {
        mangaName: '',
        volumeName: '',
        pageSeq: 0,
      };
    },
    writeReadPoint: async () => {},
    getImgSrc: () => 'jpg',
    isEqual: () => false,
    getKey: () => '',
    advanceTrackPoints: () => [],
    backTrackPoints: () => [],
    isFirstPoint: () => false,
    isLastPoint: () => false,
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

    const getTotalNum = (manga: string | Manga) => {
      let m: null | Manga = null;
      if (typeof manga === 'string') {
        m = getManga(manga);
      } else {
        m = manga;
      }
      if (m) {
        return m.volumes.reduce((acc, cur) => acc + cur[1], 0);
      }
      return 0;
    };

    const getReadPoint = async (mangaName: string): Promise<ReadPoint> => {
      const readPoint = (await fetchReadPoint(mangaName)) || null;
      if (readPoint) {
        return readPoint;
      }
      const manga = getManga(mangaName);
      return {
        mangaName,
        pageSeq: 1,
        volumeName: manga?.volumes[0][0] || '',
      };
    };

    const writeReadPoint = async (readPoint: ReadPoint): Promise<void> => {
      await saveReadPoint(readPoint);
    };

    const getSuffix = ({ mangaName, volumeName, pageSeq }: ReadPoint) => {
      const manga = getManga(mangaName);
      if (manga) {
        const volume = manga.volumes.find((e) => e[0] === volumeName);
        if (volume) {
          const suffix = volume[2];
          if (suffix.other.length === 0) {
            return suffix.main;
          }
          const t = suffix.other.find((e) => e.seqs.includes(pageSeq));
          if (!t) {
            return suffix.main;
          }
          return t.suffix;
        }
      }
      return 'jpg';
    };

    const getImgSrc = (rp: ReadPoint) => {
      return `${fetchBase}/img/${rp.mangaName}/${rp.volumeName}/${String(
        rp.pageSeq,
      ).padStart(3, '0')}.${getSuffix(rp)}`;
    };

    const findVolumes = (point: ReadPoint) => {
      const volumes = getManga(point.mangaName)?.volumes;
      const index = volumes?.findIndex((e) => e[0] === point.volumeName);
      if (index !== undefined) {
        const t = volumes as Volume[];
        return {
          volumes: t,
          index,
          volume: t[index],
        };
      }
      return undefined;
    };

    const getPointOffSet = (rp: ReadPoint) => {
      const manga = getManga(rp.mangaName);
      if (manga) {
        const volumeSet = findVolumes(rp);
        if (volumeSet) {
          return volumeSet.volumes
            .slice(0, volumeSet.index)
            .reduce((acc, c) => acc + c[1], rp.pageSeq);
        }
      }
      return 0;
    };

    const trackPoint = (rp: ReadPoint, dir: 1 | -1) => {
      const volumeSet = findVolumes(rp);
      if (volumeSet) {
        const { volumes, index, volume } = volumeSet;
        const nextSeq = rp.pageSeq + dir;
        if (nextSeq > volume[1] || nextSeq === 0) {
          const nextVolume = volumes[index + dir];
          if (!nextVolume) {
            return null;
          }
          return {
            ...rp,
            volumeName: nextVolume[0],
            pageSeq: dir > 0 ? 1 : nextVolume[1],
          };
        }
        return {
          ...rp,
          pageSeq: nextSeq,
        };
      }
      return null;
    };

    const trackPoints = (
      point: ReadPoint,
      dir: 1 | -1,
      count: number,
      onEach?: (point: ReadPoint) => any,
    ): ReadPoint[] => {
      let nextPoint: null | ReadPoint = trackPoint(point, dir);
      const points: ReadPoint[] = [];
      while (nextPoint !== null && count-- > 0) {
        if (onEach) {
          onEach(nextPoint);
        }
        points.push(nextPoint);
        nextPoint = trackPoint(nextPoint, dir);
      }
      if (dir === -1) {
        points.reverse();
      }
      return points;
    };

    const advanceTrack = (rp: ReadPoint) => trackPoint(rp, 1);

    const backTrack = (rp: ReadPoint) => trackPoint(rp, -1);

    const getKey = (rp: ReadPoint) =>
      `${rp.mangaName}/${rp.volumeName}/${rp.pageSeq}`;

    const isEqual = (a: ReadPoint | null, b: ReadPoint | null) => {
      if (a && b) {
        return (
          a.mangaName === b.mangaName &&
          a.pageSeq === b.pageSeq &&
          a.volumeName === b.volumeName
        );
      }
      return false;
    };

    const advanceTrackPoints = (
      rp: ReadPoint,
      count: number,
      onEach?: (point: ReadPoint) => any,
    ) => trackPoints(rp, 1, count, onEach);

    const backTrackPoints = (
      rp: ReadPoint,
      count: number,
      onEach?: (point: ReadPoint) => any,
    ) => trackPoints(rp, -1, count, onEach);

    const isFirstPoint = (rp: ReadPoint) => backTrack(rp) === null;

    const isLastPoint = (rp: ReadPoint) => advanceTrack(rp) === null;

    return [
      { mgs },
      {
        getManga,
        reload,
        getTotalNum,
        getReadPoint,
        writeReadPoint,
        getImgSrc,
        getPointOffSet,
        advanceTrack,
        backTrack,
        isEqual,
        getKey,
        advanceTrackPoints,
        backTrackPoints,
        isFirstPoint,
        isLastPoint,
      },
    ];
  }, [mgs]);

  return (
    <MangaContext.Provider value={value}>{children}</MangaContext.Provider>
  );
}

export const useMangaData = () => useContext(MangaContext);
