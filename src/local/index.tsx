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
  imgUrl,
} from '../service/fetch-interface';
import { useMangaDatas } from '../service/use-mangas';
import { useCheckBox, useRadio } from '../common/use-filters';
import { VirtualList } from '../common/virtual-list';

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
  // const navigate = useNavigate();

  // const jumpTo = useCallback(
  //   (e: Manga) => {
  //     navigate(`/d?mangaName=${e.name}`);
  //   },
  //   [navigate],
  // );

  const mangaList = datas.map(
    (data): Manga & { width: number; height: number } => ({
      ...data,
      width: data.cover.width,
      height: data.cover.height,
    }),
  );

  return (
    <VirtualList datas={mangaList} rowGap={10} columnGap={10}>
      {(e) => {
        return (
          <div>
            <img src={imgUrl(e.name, 'cover.jpg')} />
          </div>
        );
      }}
    </VirtualList>
  );
};

export { Local as default };
