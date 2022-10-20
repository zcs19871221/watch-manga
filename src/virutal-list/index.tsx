import { useState, useRef, ReactNode, useEffect, useLayoutEffect } from 'react';
import clx from 'classnames';

import commonStyles from './index.module.css';

const bs = (list: number[], target: number): number => {
  let start = 0;
  let end = list.length;
  while (start < end) {
    const mid = start + Math.floor((end - start) / 2);
    if (target > list[mid]) {
      start = mid + 1;
    } else {
      end = mid;
    }
  }

  return start;
};

export const VirtualList = <T extends { width: number; height: number }>({
  datas,
  rowGap = 0,
  columnGap = 0,
  cacheRatio = 1,
  styles = {},
  name,
  children,
}: {
  datas: T[];
  styles?: {
    wrapClassName?: string;
    contentClassName?: string;
  };
  rowGap?: number;
  name: string;
  cacheRatio?: number;
  columnGap?: number;
  children: (data: T, index: number) => ReactNode;
}) => {
  const dom = useRef<HTMLDivElement>(null);

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [scrollTop, setScrollTop] = useState(0);

  const key = 'scrollTop' + name;
  const length = datas.length;
  const accSum: number[] = [];
  const realHeights: number[] = [];
  let columnsCount = 1;
  if (columnGap) {
    columnsCount = Math.floor(
      (size.width + columnGap) / (datas[0].width + columnGap),
    );
  }
  let acc = 0;
  for (let i = 0; i < length; i++) {
    if (i % columnsCount === 0) {
      const { height, width } = datas[i];
      const displayHeight = Math.min(
        height,
        Math.round((size.width / width) * height),
      );
      realHeights.push(displayHeight);
      acc += displayHeight + rowGap;
    }
    accSum.push(acc);
  }

  const totalHeight = accSum[length - 1];

  const cacheDistance = (cacheRatio ?? 1) * size.height;

  const startIndex = bs(accSum, scrollTop - cacheDistance);
  const curIndex = bs(accSum, scrollTop);
  const endIndex = bs(
    accSum,
    Math.min(totalHeight, scrollTop + size.height + cacheDistance),
  );

  const transform = accSum[startIndex - 1] ?? 0;

  const displayedList = datas.slice(startIndex, endIndex + 1);
  const displayedHeights = realHeights.slice(startIndex, endIndex + 1);

  useEffect(() => {
    const calContainer = () => {
      if (dom.current) {
        const { width, height } = dom.current.getBoundingClientRect();
        setSize({ width, height });
      }
    };
    calContainer();
    window.addEventListener('resize', calContainer);
    return () => window.removeEventListener('resize', calContainer);
  }, []);

  const cache = useRef<{
    isManualScrolling: boolean;
    prevWidth: number;
    prevHeight: number;
  }>({ isManualScrolling: false, prevWidth: 0, prevHeight: 0 });

  const handleScroll = (e: any) => {
    if (cache.current.isManualScrolling) {
      return;
    }

    const currentScrollTop = e.target.scrollTop;
    localStorage.setItem(
      key,
      JSON.stringify({
        curIndex: bs(accSum, scrollTop),
        ratio:
          (accSum[curIndex] - currentScrollTop) / displayedHeights[curIndex],
      }),
    );
    setScrollTop(currentScrollTop);
  };

  useEffect(() => {
    const { prevWidth } = cache.current;
    const { index, ratio } = JSON.parse(
      localStorage.getItem(key) ?? '{index: 0, ratio: 1}',
    );

    if (size.width !== prevWidth && size.width > 0) {
      if (!dom.current) {
        return;
      }
      const targetScrollTop = accSum[index] - displayedHeights[index] * ratio;
      cache.current.isManualScrolling = true;
      setScrollTop(targetScrollTop);
      dom.current.scrollTop = targetScrollTop;
      cache.current.isManualScrolling = false;
    }
    cache.current.prevHeight = size.height;
    cache.current.prevWidth = size.width;
  }, [accSum, displayedHeights, key, size.height, size.width]);

  return (
    <div
      ref={dom}
      onScroll={handleScroll}
      className={clx(commonStyles.wrap, styles.wrapClassName)}
    >
      <div
        className={commonStyles.phantomList}
        style={{
          height: totalHeight,
        }}
      ></div>
      <div
        style={{
          transform: `translate3d(0px, ${transform}px, 0px)`,
          gridTemplateColumns: 'repeat(auto-fill, auto)',
          rowGap,
          columnGap,
        }}
        className={clx(commonStyles.displayedWrap, styles.contentClassName)}
      >
        {displayedList.map((e, index) => (
          <div style={{ height: displayedHeights[index] }}>
            {children(e, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
};
