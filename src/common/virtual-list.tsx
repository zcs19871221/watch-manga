import { useState } from 'react';

interface Props<
  T extends {
    width: number;
    height: number;
  },
> {
  datas: T[];
  columnsCount: number;
  offset: number;
  containerWidth: number;
  containerHeight: number;
  cacheRatio: number;
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

export const useVirtualScroll = <T extends { width: number; height: number }>({
  datas,
  columnsCount,
  containerHeight,
  containerWidth,
  cacheRatio,
}: Props<T>) => {
  const length = datas.length;
  const accSum = new Array(length).fill(0);

  for (let i = 1; i <= length; i++) {
    if (i % columnsCount === 0) {
      const { height, width } = datas[i - 1];
      accSum[i] += Math.min(height, (containerWidth / width) * height);
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
  const cacheDistance = cacheRatio * containerHeight;

  const transform = accSum[indexScope[0]];

  const handleScroll = (e: any) => {
    const scrollTop = e.target.scrollTop;
    const curIndexScope = calScope(scrollTop);
    if (curIndexScope[0] !== indexScope[0]) {
      setIndexScope(curIndexScope);
    }
  };

  return {
    transform,
    displayedList: datas.slice(indexScope[0], indexScope[1]),
    handleScroll,
  };
};

export const VirtualList = <
  T extends { cover: string; name: string; height: number; width: number },
>({
  datas,
  filterElements,
  operateAreaHeight,
  className,
  offsetKey,
  onClickCover,
  children,
}: {
  datas: T[];
  className?: string;
  onClickCover?: (e: T) => void;
  filterElements?: JSX.Element[];
} & OperateRelated<T>) => {
  const dom = useRef<HTMLDivElement>(null);
  const [{ offset, scrollTop }, setOffset] = useOffset(offsetKey);
  const [isScrolling, setIsScrolling] = useState(false);
  const { totalHeight, transform, handleScroll, list } = useVirtualScroll({
    datas,
    columnsCount,
    containerHeight,
    containerWidth,
    cacheRatio,
  });

  return (
    <div className={clx(styles.wrap, className)}>
      <div
        ref={dom}
        onScroll={handleScroll}
        className={clx(styles.contentWrap, className)}
      >
        <div
          className={scrollStyles.phantomList}
          style={{
            height: totalHeight,
          }}
        ></div>
        <div
          style={{
            transform: `translate3d(0px, ${transform}px, 0px)`,
          }}
          className={clx(styles.displayedWrap, 'vl-displayWrap')}
        >
          {list.map((e) => (
            <div className={clx(styles.itemWrap, 'vl-itemWrap')} key={e.name}>
              <div
                className={clx(styles.itemCover, 'vl-itemCover')}
                data-src={e.cover}
                onClick={() => {
                  if (dom.current) {
                    setOffset({ scrollTop: dom.current.scrollTop });
                  }
                  onClickCover && onClickCover(e);
                }}
                style={
                  onClickCover
                    ? {
                        cursor: 'pointer',
                      }
                    : {}
                }
              />
              <div className={clx(styles.itemInfoWrap, 'vl-itemInfoWrap')}>
                <div className={clx(styles.name, 'vl-itemName')}>{e.name}</div>
                {children ? (
                  <div
                    style={{ height: `${operateAreaHeight}px` }}
                    className={clx(styles.operateWrap, 'vl-operateWrap')}
                  >
                    {children(e)}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
