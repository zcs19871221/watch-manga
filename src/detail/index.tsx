import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMangaData, ReadPoint, Manga } from '../common/manga';

import { ModeProvider, ModeConsumter } from './mode-context';
import { Scroll } from './scroll';
import { Book } from './book';
import { Operate } from './operate';
import { usePointsSize } from '../common/point-size';

const S = React.memo(Scroll);

type TrigerChangePointSrc = 'select' | 'scroll';
export const Detail = () => {
  const [
    ,
    {
      getManga,
      getReadPoint,
      writeReadPoint,
      advanceTrackPoints,
      backTrackPoints,
      isEqual,
    },
  ] = useMangaData();

  const [, { cachePointSize }] = usePointsSize();
  const [point, setPoint] = useState<{
    p: ReadPoint;
    src: TrigerChangePointSrc;
  } | null>(null);

  const { setPointFromScroll, setPointFromSelect } = useMemo(() => {
    const setPointFactory =
      (src: TrigerChangePointSrc) =>
      (readPoint: ReadPoint, write: boolean = true) => {
        if (isEqual(readPoint, point && point.p)) {
          return;
        }
        setPoint({ p: readPoint, src });
        const preCache = (readPoint: ReadPoint, cacheCount: number) => {
          advanceTrackPoints(readPoint, cacheCount, cachePointSize);
          backTrackPoints(readPoint, cacheCount, cachePointSize);
        };
        preCache(readPoint, 5);
        if (!write) {
          return;
        }
        writeReadPoint(readPoint);
      };
    const setPointFromSelect = setPointFactory('select');
    const setPointFromScroll = setPointFactory('scroll');

    return { setPointFromSelect, setPointFromScroll };
  }, [
    advanceTrackPoints,
    backTrackPoints,
    cachePointSize,
    isEqual,
    point,
    writeReadPoint,
  ]);

  const [manga, setManga] = useState<Manga | null>(null);

  const mangaName = useSearchParams()[0].get('mangaName');

  useEffect(() => {
    (async function () {
      if (!mangaName) {
        return;
      }
      const point = await getReadPoint(mangaName);
      setPointFromSelect(point, false);
      setManga(getManga(mangaName));
    })();
  }, [getManga, getReadPoint, mangaName, setPointFromSelect]);

  if (!manga || !point) {
    return <div></div>;
  }

  return (
    <ModeProvider>
      <ModeConsumter>
        {(mode) => {
          return (
            <>
              {mode === 'Scroll' && (
                <S
                  manga={manga}
                  point={point.p}
                  pointChangeSrc={point.src}
                  setPoint={setPointFromScroll}
                />
              )}
              {(mode === 'Book' || mode === 'Manga') && (
                <Book
                  point={point.p}
                  setPoint={setPointFromSelect}
                  mode={mode}
                />
              )}
              <Operate readPoint={point.p} setReadPoint={setPointFromSelect} />
            </>
          );
        }}
      </ModeConsumter>
    </ModeProvider>
  );
};
