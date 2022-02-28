import React, { useState, useCallback, useRef, useMemo } from 'react';
import cx from 'classnames';
import { useMangaData, ReadPoint } from '../../common/manga';
import { Content } from '../content';
import { operateClickableArea } from '../config';
import { useViewPort } from '../../common/viewport';
import styles from './index.module.css';

export const Book = ({
  point,
  setPoint,
  mode,
}: {
  point: ReadPoint;
  mode: 'Manga' | 'Book';
  setPoint: (rp: ReadPoint) => void;
}) => {
  const [, { getImgSrc, backTrack, advanceTrack }] = useMangaData();
  const { vw, vh } = useViewPort();
  const [animationClass, setAnimationClass] = useState('');
  const [isSliding, setIsSliding] = useState(false);
  const { handlePrev, handleNext } = useMemo(() => {
    const handleFactory = (dir: 'Right' | 'Left') => () => {
      if (isSliding) {
        return;
      }
      let method = advanceTrack;
      if (
        (mode === 'Manga' && dir === 'Right') ||
        (mode === 'Book' && dir === 'Left')
      ) {
        method = backTrack;
      }
      const nextPoint = method(point);
      if (nextPoint) {
        setPoint(nextPoint);
        setAnimationClass(styles[`to${dir}`]);
      }
    };
    const handlePrev = handleFactory('Left');
    const handleNext = handleFactory('Right');
    return { handlePrev, handleNext };
  }, [advanceTrack, backTrack, isSliding, mode, point, setPoint]);
  const points = useMemo(() => {
    const newPoints = [backTrack(point), point, advanceTrack(point)].map(
      (e) => {
        if (e) {
          return { ...e, src: getImgSrc(e) };
        }
        return e;
      },
    );

    if (mode === 'Manga') {
      newPoints.reverse();
    }
    return newPoints;
  }, [advanceTrack, backTrack, getImgSrc, mode, point]);

  const prevTouchX = useRef(0);
  const onTouchStart = useCallback((e: any) => {
    const currentX = e.changedTouches[0].pageX;
    prevTouchX.current = currentX;
  }, []);
  const onTouchEnd = useCallback(
    (e: any) => {
      const currentX = e.changedTouches[0].pageX;
      const sub = currentX - prevTouchX.current;
      if (Math.abs(sub) < 2) {
        return;
      }
      if (currentX > prevTouchX.current) {
        handlePrev();
      } else {
        handleNext();
      }
    },
    [handleNext, handlePrev],
  );

  const handleClick = useCallback(
    (e) => {
      const whichArea =
        (config: { x: number; y?: undefined } | { y: number; x?: undefined }) =>
        (clickPoint: { x: number; y: number }): 'left' | 'right' | 'middle' => {
          let clickAbleRatio = 1;
          let screenDistance = 1;
          let distance = 1;
          if (config.x !== undefined) {
            clickAbleRatio = config.x;
            screenDistance = vw;
            distance = clickPoint.x;
          } else {
            clickAbleRatio = config.y;
            screenDistance = vh;
            distance = clickPoint.y;
          }

          const line1 = (screenDistance * (1 - clickAbleRatio)) / 2;
          const line2 = line1 + screenDistance * clickAbleRatio;
          if (distance <= line1) {
            return 'left';
          }
          if (distance >= line2) {
            return 'right';
          }
          return 'middle';
        };
      const isInArea = whichArea({ x: operateClickableArea.x });
      const dir = isInArea({ x: e.clientX, y: e.clientY });
      if (dir === 'left') {
        handlePrev();
      }
      if (dir === 'right') {
        handleNext();
      }
    },
    [handleNext, handlePrev, vh, vw],
  );

  const onAnimationStart = useCallback(() => setIsSliding(true), []);
  const onAnimationEnd = useCallback(() => {
    setIsSliding(false);
    setAnimationClass('');
  }, []);

  return (
    <div
      className={cx(styles.wrap)}
      onClick={handleClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={cx(styles.imgsWrap, styles.animation, animationClass)}
        onAnimationEnd={onAnimationEnd}
        onAnimationStart={onAnimationStart}
      >
        <Content imgs={points} />
      </div>
    </div>
  );
};
