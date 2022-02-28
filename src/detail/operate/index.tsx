import React, { useState, useRef, useEffect, useCallback } from 'react';
import cx from 'classnames';

import { ReadPoint } from '../../common/manga';
import { useViewPort } from '../../common/viewport';
import { checkMisClickOperateTime, operateClickableArea } from '../config';
import { HomePage } from './homepage';
import { ModeSwitch } from './mode-switch';
import { ChapterJumper } from './chapter-jumper';

import styles from './index.module.css';

interface Position {
  x: number;
  y: number;
}

export const Operate = ({
  readPoint,
  setReadPoint,
}: {
  setReadPoint: (rp: ReadPoint) => void;
  readPoint: ReadPoint | null;
}) => {
  const [isShow, setIsShow] = useState(false);
  const { vh, vw } = useViewPort();

  const activeCount = useRef(0);

  const [trackFlag, setTrackFlag] = useState(0);
  const timer = useRef<any>();

  const isInOperateTriggerArea = useCallback(
    (clickPoint: Position) => {
      return (
        Object.entries(clickPoint) as [
          keyof Position,
          Position[keyof Position],
        ][]
      ).every(([type, distance]) => {
        const clickAbleRatio = operateClickableArea[type];
        const screenDistance = type === 'x' ? vw : vh;
        const line1 = (screenDistance * (1 - clickAbleRatio)) / 2;
        const line2 = line1 + screenDistance * clickAbleRatio;
        return distance >= line1 && distance <= line2;
      });
    },
    [vh, vw],
  );

  const counter = (e: any) => {
    // console.log('trigger');
    activeCount.current += 1;
  };

  const handleClick = useCallback(
    (e: any) => {
      if (isInOperateTriggerArea({ x: e.clientX, y: e.clientY })) {
        activeCount.current = 0;
        // console.log('set trackfalg');
        setTrackFlag((prev) => (prev + 1) % 100);
      }
    },
    [isInOperateTriggerArea],
  );

  useEffect(() => {
    const dom = document.documentElement;
    if (!isShow) {
      dom.addEventListener('click', handleClick);
    }
    return () => {
      dom.removeEventListener('click', handleClick);
    };
  }, [handleClick, isShow]);

  useEffect(() => {
    if (trackFlag === 0) {
      return;
    }
    timer.current = setTimeout(() => {
      // console.log('timeout');
      if (activeCount.current === 0) {
        setIsShow(true);
      }
      setTrackFlag(0);
    }, checkMisClickOperateTime);
    const dom = document.documentElement;
    dom.addEventListener('click', counter);

    return () => {
      clearTimeout(timer.current);
      dom.removeEventListener('click', counter);
      // console.log('remove listerner clearn timer');
    };
  }, [trackFlag]);

  const close = useCallback(() => setIsShow(false), []);

  return isShow && readPoint ? (
    <div className={styles.wrap}>
      <div
        className={cx(styles.header, styles.section)}
      >{`${readPoint.volumeName} ${readPoint.pageSeq}`}</div>
      <div className={styles.overlay} onClick={close}></div>
      <div className={cx(styles.footer, styles.section)}>
        <div className={styles.featureWrap}>
          <HomePage />
          <ModeSwitch />
          <ChapterJumper setReadPoint={setReadPoint} point={readPoint} />
        </div>
      </div>
    </div>
  ) : null;
};
