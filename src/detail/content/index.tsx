import React, { useCallback } from 'react';
import styles from './index.module.css';
import { ImgPoint } from '../../common/manga';
import { usePointsSize } from '../../common/point-size';

export const Content = ({
  imgs,
  style,
}: {
  imgs: (ImgPoint | null)[];
  style?: object;
}) => {
  const [, { recordPointSize }] = usePointsSize();

  const handleOnLoad = useCallback(
    (e) => {
      const target = e.target as any;
      const { mname, vname, seq } = target.dataset;
      const readPoint = {
        mangaName: String(mname),
        volumeName: String(vname),
        pageSeq: Number(seq),
      };
      recordPointSize({
        readPoint,
        width: target.naturalWidth,
        height: target.naturalHeight,
      });
    },
    [recordPointSize],
  );
  return (
    <>
      {imgs.map((e) => {
        const { src, volumeName, mangaName, pageSeq } = e || {
          src: '',
          volumeName: '',
          mangaName: '',
          pageSeq: '',
        };
        return (
          <div
            className={styles.wrap}
            data-mname={mangaName}
            data-vname={volumeName}
            data-seq={pageSeq}
            data-src={src}
            style={style}
          >
            {src ? (
              <img
                src={src}
                alt=''
                className={styles.img}
                onLoad={handleOnLoad}
                data-mname={mangaName}
                data-vname={volumeName}
                data-seq={pageSeq}
              />
            ) : (
              <div className={styles.img}>到头了</div>
            )}
          </div>
        );
      })}
    </>
  );
};
