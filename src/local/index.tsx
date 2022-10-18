import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { List } from '../common/list';
import {
  delManga,
  markMangaReaded,
  collectManga,
  unCollectManga,
  markMangaUnReaded,
  Manga,
  fetchMangas,
} from '../service/fetch-interface';
import { useMangaDatas } from '../service/use-mangas';
import { useCheckBox, useRadio } from '../common/use-filters';

const useFilter = (mgs: Manga[]) => {
  const readStatusOptions: {
    value: 'all' | 'readed' | 'unread';
    text: string;
  }[] = [
    { value: 'all', text: '全部' },
    { value: 'readed', text: '已读' },
    { value: 'unread', text: '未读' },
  ];
  const [{ Component: ReadStatus, value: readStatus }] = useRadio<
    typeof readStatusOptions[number]['value']
  >({
    init: (localStorage.getItem('readStatus') as any) || 'all',
    options: readStatusOptions,
    onChange: (v: any) => {
      localStorage.setItem('readStatus', v);
    },
  });
  const [{ Component: Collect, value: isCollect }] = useCheckBox({
    init: localStorage.getItem('isCollect') === 'true' || false,
    label: '收藏',
    onChange: (v: any) => {
      localStorage.setItem('isCollect', v);
    },
  });

  if (readStatus === 'unread' || readStatus === 'readed') {
    mgs = mgs.filter((e) =>
      readStatus === 'readed' ? e.hasBeenRead : !e.hasBeenRead,
    );
  }
  mgs = mgs.filter((e) =>
    isCollect ? e.hasBeenCollected : !e.hasBeenCollected,
  );
  return [{ datas: mgs, Filters: [ReadStatus, Collect] }];
};
export const Local = () => {
  const [{ mgs }, { reload }] = useMangaDatas();
  const [{ datas, Filters }] = useFilter(mgs);
  const navigate = useNavigate();

  const jumpTo = useCallback(
    (e: Manga) => {
      navigate(`/d?mangaName=${e.name}`);
    },
    [navigate],
  );

  return (
    <List
      datas={datas}
      onClickCover={jumpTo}
      operateAreaHeight={25}
      filterElements={Filters}
      offsetKey='list'
    >
      {(e) => {
        return (
          <>
            <button
              onClick={() => {
                if (window.confirm('是否删除')) {
                  delManga(e.name).then(reload);
                }
              }}
            >
              删除
            </button>
            {!e.isCollect && (
              <button
                onClick={() => collectManga(e.name).then(reload)}
                style={{ marginLeft: '5px' }}
              >
                收藏
              </button>
            )}
            {e.isCollect && (
              <button
                onClick={() => unCollectManga(e.name).then(reload)}
                style={{ marginLeft: '5px' }}
              >
                取消收藏
              </button>
            )}
            {!e.readed && (
              <button
                onClick={() => markMangaReaded(e.name).then(reload)}
                style={{ marginLeft: '5px' }}
              >
                读完
              </button>
            )}
            {e.readed && (
              <button
                onClick={() => markMangaUnReaded(e.name).then(reload)}
                style={{ marginLeft: '5px' }}
              >
                未读
              </button>
            )}
          </>
        );
      }}
    </List>
  );
};

export { Local as default };
