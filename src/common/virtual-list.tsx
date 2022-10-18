import { useState, useRef, ReactNode } from 'react';
import clx from 'classnames';
import commonStyles from './list.module.css';

interface CommonProps {
  width: number;
  height: number;
}
interface Props<T extends CommonProps> {
  datas: T[];
  columnGap: number;
  rowGap: number;
  containerWidth: number;
  containerHeight: number;
  cacheRatio?: number;
}
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

export const useVirtualScroll = <T extends CommonProps>({
  datas,
  columnGap = 0,
  rowGap = 0,
  containerHeight,
  containerWidth,
  cacheRatio,
}: Props<T>) => {
  const length = datas.length;
  const accSum = new Array(length).fill(0);
  let columnsCount = 1;
  if (columnGap) {
    columnsCount = Math.floor(
      (containerWidth + columnGap) / (datas[0].width + columnGap),
    );
  }
  for (let i = 1; i <= length; i++) {
    if (i % columnsCount === 0) {
      const { height, width } = datas[i - 1];
      accSum[i] += Math.min(height, (containerWidth / width) * height) + rowGap;
    } else {
      accSum[i] = accSum[i - 1];
    }
  }

  const totalHeight = accSum[length - 1];

  const calScope = (scrollTop: number) => {
    const startIndex = bs(accSum, Math.max(0, scrollTop - cacheDistance));
    const endIndex = bs(
      accSum,
      Math.min(totalHeight, scrollTop + containerHeight + cacheDistance),
    );
    return [startIndex, endIndex] as const;
  };
  const [indexScope, setIndexScope] = useState<readonly [number, number]>(
    calScope(0),
  );
  const cacheDistance = (cacheRatio ?? 1) * containerHeight;

  const transform = accSum[indexScope[0]];

  const handleScroll = (e: any) => {
    const scrollTop = e.target.scrollTop;
    const curIndexScope = calScope(scrollTop);
    if (curIndexScope[0] !== indexScope[0]) {
      setIndexScope(curIndexScope);
    }
  };

  return {
    totalHeight,
    transform,
    displayedList: datas.slice(indexScope[0], indexScope[1]),
    handleScroll,
  };
};

export const VirtualList = <T extends { width: number; height: number }>({
  datas,
  rowGap,
  columnGap,
  styles = {},
  children,
}: {
  datas: T[];
  styles?: {
    wrapClassName?: string;
    contentClassName?: string;
  };
  rowGap: number;
  columnGap: number;
  children: (data: T) => ReactNode;
}) => {
  const dom = useRef<HTMLDivElement>(null);
  const containerWidth = 0;
  const containerHeight = 0;

  const { transform, displayedList, handleScroll, totalHeight } =
    useVirtualScroll({
      datas,
      containerHeight,
      rowGap,
      columnGap,
      containerWidth,
    });

  return (
    <div
      ref={dom}
      onScroll={handleScroll}
      className={clx(commonStyles.contentWrap, styles.contentClassName)}
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
        }}
        className={clx(commonStyles.displayedWrap, styles.contentClassName)}
      >
        {displayedList.map(children)}
      </div>
    </div>
  );
};
