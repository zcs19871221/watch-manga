import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import cx from 'classnames';
import { useMangaData, Manga, ReadPoint } from '../../common/manga';

import styles from './index.module.css';
import { usePointsSize } from '../../common/point-size';
import { useViewPort } from '../../common/viewport';
import { Content } from '../content';

import { prevBufCount, nextBufCount, displayCount } from '../config';

interface PointPosition extends ReadPoint {
  bottom: number;
  height: number;
}

export const Scroll = ({
  manga,
  point,
  pointChangeSrc,
  setPoint,
}: {
  manga: Manga;
  point: ReadPoint;
  pointChangeSrc: 'select' | 'scroll';
  setPoint: (r: ReadPoint) => void;
}) => {
  const [
    ,
    {
      getTotalNum,
      getImgSrc,
      getPointOffSet,
      getKey,
      backTrackPoints,
      advanceTrackPoints,
      isFirstPoint,
      isEqual,
    },
  ] = useMangaData();

  const wrapDom = useRef<null | HTMLDivElement>(null);

  const { vw, vh } = useViewPort();
  const [, { getPointRealHeight, getPointRealHeightSync }] = usePointsSize();

  const calcPoint = useCallback(
    (startPoint: ReadPoint) => {
      const preBufPoints = backTrackPoints(startPoint, prevBufCount);
      const displayPoints = [
        startPoint,
        ...advanceTrackPoints(startPoint, displayCount - 1),
      ];
      const nextBufPoints = advanceTrackPoints(
        displayPoints[displayPoints.length - 1],
        nextBufCount,
      );

      return [...preBufPoints, ...displayPoints, ...nextBufPoints].map((e) => ({
        ...e,
        src: getImgSrc(e),
      }));
    },
    [advanceTrackPoints, backTrackPoints, getImgSrc],
  );

  const prevPointsHeightSum = useCallback(
    (oneOfPoints: ReadPoint, points: ReadPoint[], vw: number) => {
      const index = points.findIndex((e) => getKey(e) === getKey(oneOfPoints));
      if (index > -1) {
        return points.slice(0, index).reduce((acc: number | null, cur) => {
          if (acc === null) {
            return null;
          }
          const h = getPointRealHeightSync(cur, vw);
          if (h === null) {
            return null;
          }
          return acc + h;
        }, 0);
      }
      return null;
    },
    [getKey, getPointRealHeightSync],
  );

  const getPointsPostion = useCallback(
    (
      points: ReadPoint[],
      transform: number,
      vw: number,
    ): (null | PointPosition)[] => {
      let prev: null | number = transform;
      return points.map((point) => {
        if (prev === null) {
          return null;
        }
        const pointHeight = getPointRealHeightSync(point, vw);
        if (pointHeight !== null) {
          const bottom = prev + pointHeight;
          prev += pointHeight;
          return {
            bottom,
            height: pointHeight,
            ...point,
          };
        }
        prev = null;
        return null;
      });
    },
    [getPointRealHeightSync],
  );

  const rePositionStatus = useRef({
    isPositioning: true,
    hasHeight: false,
  });
  const prevData = useRef<{
    prevPoint: null | ReadPoint;
    prevVw: number;
  }>({
    prevPoint: null,
    prevVw: vw,
  });

  const [offsetY, setOffsetY] = useState(0);

  const renderingPoints = useMemo(() => {
    return calcPoint(point);
  }, [calcPoint, point]);

  useEffect(() => {
    if (!wrapDom.current) {
      return;
    }

    // 第一次进去或通过选择器定位到新章节 没法计算真实偏移 模拟一个scroll 过去
    const { prevPoint, prevVw } = prevData.current;
    if (
      pointChangeSrc === 'select' &&
      !isEqual(prevPoint, point) &&
      prevVw === vw
    ) {
      // console.log('init');
      rePositionStatus.current.isPositioning = true;
      if (!rePositionStatus.current.hasHeight) {
        const wholeMangaPoints: number = getTotalNum(manga);
        const p = wrapDom.current.querySelector<HTMLDivElement>(
          `.${styles.phantomList}`,
        );
        if (p) {
          p.style.height = `${wholeMangaPoints * vh}px`;
          rePositionStatus.current.hasHeight = true;
        }
      }

      const startIndex = getPointOffSet(point);
      const initScrollOffset = (startIndex - 1) * vh;

      (wrapDom.current as any).scrollTop = initScrollOffset;

      const tasks: Promise<number>[] = [];
      backTrackPoints(point, prevBufCount, (rp) => {
        tasks.push(getPointRealHeight(rp, vw));
      });
      Promise.all(tasks).then((heights) => {
        setOffsetY(initScrollOffset - heights.reduce((a, b) => a + b, 0));
        rePositionStatus.current.isPositioning = false;
      });
      return;
    }
    if (isEqual(prevPoint, point) && prevVw !== vw) {
      // 移动端旋转屏幕滚动条自动同步了
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )
      ) {
        return;
      }
      const prevPointHeightSum = prevPointsHeightSum(
        point,
        renderingPoints,
        prevVw,
      );
      const curPointHeightSum = prevPointsHeightSum(point, renderingPoints, vw);
      const prevPointHeight = getPointRealHeightSync(point, prevVw);
      const curHeight = getPointRealHeightSync(point, vw);
      if (
        curPointHeightSum !== null &&
        curPointHeightSum !== null &&
        prevPointHeight !== null &&
        curHeight !== null &&
        prevPointHeightSum !== null
      ) {
        setOffsetY(
          offsetY +
            ((wrapDom.current.scrollTop - offsetY - prevPointHeightSum) /
              prevPointHeight) *
              (prevPointHeight - curHeight) +
            prevPointHeightSum -
            curPointHeightSum,
        );
      }
    }
  }, [
    backTrackPoints,
    getPointOffSet,
    getPointRealHeight,
    getPointRealHeightSync,
    getTotalNum,
    isEqual,
    manga,
    offsetY,
    point,
    pointChangeSrc,
    prevPointsHeightSum,
    renderingPoints,
    vh,
    vw,
  ]);

  useEffect(() => {
    prevData.current = {
      prevPoint: point,
      prevVw: vw,
    };
  });

  const update = useCallback(
    (event: any) => {
      if (rePositionStatus.current.isPositioning) {
        return;
      }

      const scrollTop = event.target.scrollTop;

      const bottoms = getPointsPostion(renderingPoints, offsetY, vw);

      const min: number | undefined = bottoms[0]
        ? bottoms[0].bottom - bottoms[0].height
        : -Infinity;
      const max = bottoms[bottoms.length - 1]
        ? (bottoms[bottoms.length - 1] as any).bottom
        : Infinity;

      if (
        (scrollTop < min && isFirstPoint(renderingPoints[0])) ||
        scrollTop > max /* - viewport.vh */
      ) {
        event.target.scrollTop =
          scrollTop < min ? min : !Number.isFinite(min) ? min : max - vh;
        return;
      }

      let t: null | PointPosition = null;

      for (const each of bottoms) {
        if (each === null) {
          break;
        }
        if (each.bottom > scrollTop) {
          t = each;
          break;
        }
      }

      if (t && !isEqual(t, point)) {
        const newStartPoint = {
          mangaName: t.mangaName,
          volumeName: t.volumeName,
          pageSeq: t.pageSeq,
        };
        const newAllPoint = calcPoint(newStartPoint);

        setPoint(newStartPoint);
        const prevSum = prevPointsHeightSum(newStartPoint, renderingPoints, vw);
        const newSum = prevPointsHeightSum(newStartPoint, newAllPoint, vw);
        if (prevSum === null || newSum === null) {
          return;
        }
        if (prevSum !== newSum) {
          return setOffsetY(offsetY + (prevSum - newSum));
        }
      }
    },
    [
      calcPoint,
      getPointsPostion,
      isEqual,
      isFirstPoint,
      offsetY,
      point,
      prevPointsHeightSum,
      renderingPoints,
      setPoint,
      vh,
      vw,
    ],
  );

  return (
    <div className={cx(styles.wrap)} ref={wrapDom} onScroll={update}>
      <div className={styles.phantomList}></div>
      <div
        className={cx(styles.imgsWrap)}
        style={{
          transform: `translate3d(0px, ${offsetY}px, 0px)`,
        }}
      >
        <Content imgs={renderingPoints} style={{ height: 'auto' }} />
      </div>
    </div>
  );
};
