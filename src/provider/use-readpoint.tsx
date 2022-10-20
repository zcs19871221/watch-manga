import { useState, useEffect, useMemo } from 'react';
import {
  ReadPoint,
  fetchReadPoint,
  saveReadPoint,
} from '../service/fetch-interface';

export const useReadPoint = (
  mangaName: string,
  type: 'volumes' | 'chapters',
) => {
  const [readPoint, setReadPoint] = useState<ReadPoint | null>(null);

  useEffect(() => {
    (async function () {
      const point = await fetchReadPoint(mangaName);
      setReadPoint(point);
    })();
  }, [mangaName]);

  return useMemo(() => {
    const updatePoint = (num: number) => {
      if (readPoint) {
        saveReadPoint({ ...readPoint, [type]: num });
      }
    };
    return {
      readPoint,
      seq: readPoint?.[type],
      updatePoint,
    } as const;
  }, [readPoint, type]);
};
