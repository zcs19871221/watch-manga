import React, { useState } from 'react';

import { Feature } from './feature';
import { ReactComponent as Chapter } from './assets/chapter.svg';
import { useMangaData, ReadPoint, ImgPoint } from '../../common/manga';
import styles from './chapter.module.css';

export const ChapterModal = ({
  point,
  setReadPoint,
  toggleModal,
}: {
  point: ReadPoint;
  setReadPoint: (rp: ReadPoint) => void;
  toggleModal: () => void;
}) => {
  const [, { getManga, getImgSrc }] = useMangaData();
  const manga = getManga(point.mangaName);
  if (!manga) {
    return null;
  }
  const mangaName = manga.name;

  const readPoints: ImgPoint[] = manga.volumes.map((e) => {
    const rp = { mangaName, volumeName: e[0], pageSeq: 1 };
    return {
      ...rp,
      src: getImgSrc(rp),
    };
  });

  return (
    <div className={styles.mask}>
      <div className={styles.header}>
        <div onClick={toggleModal} style={{ marginRight: '20px' }}>
          X
        </div>
        <div>{manga.name}</div>
      </div>
      <div className={styles.content}>
        {readPoints.map((rp) => (
          <div
            className={styles.chapterWrap}
            onClick={() => {
              setReadPoint(rp);
              toggleModal();
            }}
          >
            <div
              className={styles.chapterCover}
              style={{
                backgroundImage: `url(${rp.src}`,
              }}
            ></div>
            <div className={styles.chapterName}>{rp.volumeName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export const ChapterJumper = ({
  point,
  setReadPoint,
}: {
  point: ReadPoint;
  setReadPoint: (rp: ReadPoint) => void;
}) => {
  const [showChapterModal, setChapterModal] = useState(false);

  const toggleModal = () => setChapterModal((prev) => !prev);
  return (
    <>
      <Feature
        isClicked={showChapterModal}
        onClick={toggleModal}
        name='章节'
        Icon={Chapter}
      />
      {showChapterModal && (
        <ChapterModal
          point={point}
          setReadPoint={setReadPoint}
          toggleModal={toggleModal}
        />
      )}
    </>
  );
};
