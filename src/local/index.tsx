import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useMangaData, Manga } from '../common/manga';
import { List } from '../common/list';
import { delManga } from '../common/fetch-interface';

export const Local = () => {
  const [{ mgs }, { reload }] = useMangaData();
  const navigate = useNavigate();

  const jumpTo = useCallback(
    (e: Manga) => {
      navigate(`/d?mangaName=${e.name}`);
    },
    [navigate],
  );

  const operateHeight = 22;

  return (
    <List datas={mgs} onClickCover={jumpTo} operateAreaHeight={operateHeight}>
      {(e) => {
        return (
          <div style={{ height: `${operateHeight}px` }}>
            <button
              onClick={() => {
                if (window.confirm('是否删除')) {
                  delManga(e.name).then(reload);
                }
              }}
            >
              删除
            </button>
          </div>
        );
      }}
    </List>
  );
};

export { Local as default };
