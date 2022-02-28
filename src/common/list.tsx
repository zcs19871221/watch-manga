import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import clx from 'classnames';
import styles from './list.module.css';
import { useViewPort } from './viewport';
import scrollStyles from '../detail/scroll/index.module.css';

const useVirtualScroll = <T,>(
  mgs: T[],
  listTop: number,
  infoAreaHeight: number = 45,
) => {
  const { vw, vh } = useViewPort();

  const { rows, columns, totalHeight, gap, itemHeight } = useMemo(() => {
    const itemWidth = 180;
    const contentLeftRightPadding = 10;
    const gap = 15;
    const picRatio = 4 / 3;
    const itemNameHeight = 22;
    const itemHeight = itemWidth * picRatio + infoAreaHeight + itemNameHeight;

    const columns = Math.floor(
      (vw - contentLeftRightPadding * 2 + gap) / (itemWidth + gap),
    );
    const rows = Math.ceil((vh - listTop + gap) / (itemHeight + gap));
    const totalHeight =
      (Math.ceil(mgs.length / columns) - 1) * (itemHeight + gap) + itemHeight;
    return {
      rows,
      columns,
      totalHeight,
      gap,
      itemHeight,
    };
  }, [infoAreaHeight, listTop, mgs.length, vh, vw]);
  const [startIndex, setStartIndex] = useState(0);
  const [transform, setTransform] = useState(0);

  const cacheCount = columns * 2;

  const list = useMemo(() => {
    const begin = Math.max(0, startIndex - cacheCount);
    const end = Math.min(startIndex + rows * columns + cacheCount, mgs.length);

    return mgs.slice(begin, end);
  }, [cacheCount, columns, mgs, rows, startIndex]);

  const handleScroll = useCallback(
    (e) => {
      const getBegin = (index: number) => Math.max(0, index - cacheCount);

      const top = e.target.scrollTop;
      const currentStartIndex = Math.floor(top / (itemHeight + gap)) * columns;
      if (startIndex !== currentStartIndex) {
        setStartIndex(currentStartIndex);
        const curBegin = getBegin(currentStartIndex);
        const prevBegin = getBegin(startIndex);
        const sub =
          (currentStartIndex - prevBegin - (currentStartIndex - curBegin)) /
          columns;
        if (sub !== 0) {
          setTransform((prev) => prev + sub * (itemHeight + gap));
        }
      }
    },
    [cacheCount, columns, gap, itemHeight, startIndex],
  );

  return { transform, handleScroll, totalHeight, list };
};

type OperateRelated<T> =
  | {
      children: (item: T) => JSX.Element;
      operateAreaHeight: number;
    }
  | {
      children?: undefined;
      operateAreaHeight?: undefined;
    };

export const List = <T extends { cover: string; name: string }>({
  datas,
  filterElements,
  operateAreaHeight,
  className,
  onClickCover,
  children,
}: {
  datas: T[];
  className?: string;
  onClickCover?: (e: T) => void;
  filterElements?: JSX.Element[];
} & OperateRelated<T>) => {
  const dom = useRef<HTMLDivElement>(null);

  const { totalHeight, transform, handleScroll, list } = useVirtualScroll(
    datas,
    filterElements ? 50 : 0,
    operateAreaHeight || 0,
  );

  useEffect(() => {
    if (!dom.current) {
      return;
    }
    const imgs = Array.from(
      dom.current.querySelectorAll(`.${styles.itemCover}`),
    ) as HTMLImageElement[];
    if (imgs.length === 0) {
      return;
    }
    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLDivElement;
            const url = target.dataset.src;
            if (url) {
              target.style.backgroundImage = `url(${url})`;
            }
            ob.unobserve(target);
          }
        });
      },
      { rootMargin: '5px' },
    );

    imgs.forEach((img) => {
      ob.observe(img);
    });
    return () => {
      imgs.forEach((img) => {
        ob.unobserve(img);
      });
    };
  }, [list]);

  return (
    <div className={clx(styles.wrap, className)}>
      {filterElements && (
        <div className={styles.filterWrap}>
          {filterElements?.map((e) => (
            <div className={styles.filterItem}>{e}</div>
          ))}
        </div>
      )}
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
                onClick={() => onClickCover && onClickCover(e)}
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
                {children ? children(e) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
