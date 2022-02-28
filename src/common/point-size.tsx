import React, { useRef, useMemo, createContext, useContext } from 'react';
import { useMangaData, ReadPoint } from './manga';

interface PointSize {
  key: string;
  height: number;
  width: number;
}

type PointSizeContextType = [
  {
    pointsSize: PointSize[];
  },
  {
    getPointRealHeightSync: (p: ReadPoint, vw: number) => number | null;
    getPointRealHeight: (p: ReadPoint, vw: number) => Promise<number>;
    readPointSize: (p: ReadPoint) => PointSize | null;
    cachePointSize: (p: ReadPoint) => Promise<PointSize>;
    recordPointSize: ({
      readPoint,
      width,
      height,
    }: {
      readPoint: ReadPoint;
      width: number;
      height: number;
    }) => void;
  },
];

const PointSizeContext = createContext<PointSizeContextType>([
  {
    pointsSize: [],
  },
  {
    getPointRealHeightSync: () => null,
    readPointSize: () => null,
    getPointRealHeight: () => Promise.resolve(0),
    cachePointSize: () => Promise.resolve({ key: '', height: 0, width: 0 }),
    recordPointSize: () => Promise.resolve(0),
  },
]);

export const PointSizeProvider = ({ children }: { children: any }) => {
  const pointsSize = useRef<PointSize[]>([]);
  const [, { getImgSrc, getKey }] = useMangaData();

  const value = useMemo(() => {
    const calcRealHeight = (
      naturalHeight: number,
      naturalWidth: number,
      vw: number,
    ): number => {
      return Math.min(naturalHeight, (vw / naturalWidth) * naturalHeight);
    };

    const getPointRealHeightSync = (point: ReadPoint, vw: number) => {
      const key = getKey(point);
      const t = pointsSize.current.find((e) => e.key === key);
      if (t) {
        return calcRealHeight(t.height, t.width, vw);
      }
      return null;
    };

    const getPointRealHeight = async (point: ReadPoint, vw: number) => {
      const pointSize = await cachePointSize(point);
      return calcRealHeight(pointSize.height, pointSize.width, vw);
    };

    const readPointSize = (point: ReadPoint) => {
      const key = getKey(point);
      const t = pointsSize.current.find((e) => e.key === key);
      if (t) {
        return t;
      }
      return null;
    };

    const cachePointSize = (point: ReadPoint): Promise<PointSize> => {
      return new Promise((resolve) => {
        const pointSize = readPointSize(point);
        if (pointSize !== null) {
          return resolve(pointSize);
        }
        const img = new Image();

        const onload = (e: any) => {
          const t = readPointSize(point);
          if (t !== null) {
            img.onload = null;
            return resolve(t);
          }
          const { naturalWidth, naturalHeight } = e.target as any;
          const pointSize = {
            key: getKey(point),
            width: naturalWidth,
            height: naturalHeight,
          };
          pointsSize.current.push(pointSize);
          img.onload = null;
          img.onerror = null;
          resolve(pointSize);
        };
        img.onload = onload;

        img.src = getImgSrc(point);
      });
    };

    const recordPointSize = ({
      readPoint,
      width,
      height,
    }: {
      readPoint: ReadPoint;
      width: number;
      height: number;
    }) => {
      if (readPointSize(readPoint) === null) {
        pointsSize.current.push({
          key: getKey(readPoint),
          height,
          width,
        });
      }
    };

    const value: PointSizeContextType = [
      {
        pointsSize: pointsSize.current,
      },
      {
        getPointRealHeightSync,
        getPointRealHeight,
        readPointSize,
        cachePointSize,
        recordPointSize,
      },
    ];

    return value;
  }, [getImgSrc, getKey]);

  return (
    <PointSizeContext.Provider value={value}>
      {children}
    </PointSizeContext.Provider>
  );
};

export const usePointsSize = () => useContext(PointSizeContext);
