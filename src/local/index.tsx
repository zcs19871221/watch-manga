import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useMangaData, Manga } from '../common/manga';
import { List } from '../common/list';
import { delManga, markMangaReaded } from '../common/fetch-interface';
import { useSelect } from '../common/use-filters';

const useFilter = (mgs: Manga[]) => {
  const readStatusOptions: {
    value: 'all' | 'readed' | 'unread';
    text: string;
  }[] = [
    { value: 'all', text: '全部' },
    { value: 'readed', text: '已读' },
    { value: 'unread', text: '未读' },
  ];
  const [{ Component: ReadStatus, value: readStatus }] = useSelect<
    typeof readStatusOptions[number]['value']
  >({
    label: '范围',
    init: mgs.filter((e) => e.readed).length > 0 ? 'unread' : 'all',
    options: readStatusOptions,
  });

  if (readStatus === 'unread' || readStatus === 'readed') {
    mgs = mgs.filter((e) => (readStatus === 'unread' ? !e.readed : e.readed));
  }
  return [{ datas: mgs, Filters: [ReadStatus] }];
};
export const Local = () => {
  const [{ mgs }, { reload }] = useMangaData();
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
            {!e.readed && (
              <button
                onClick={() => markMangaReaded(e.name).then(reload)}
                style={{ marginLeft: '5px' }}
              >
                读完
              </button>
            )}
          </>
        );
      }}
    </List>
  );
};

export { Local as default };
