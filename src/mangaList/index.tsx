import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { VirtualList } from '../virutal-list';
import { Manga, imgUrl } from '../service/fetch-interface';
import { useMangaData } from '../provider/mangas';

export const MangaList = () => {
  const { mgs } = useMangaData();
  const navigage = useNavigate();
  if (mgs.length === 0) {
    return null;
  }

  const mangaList = mgs.map(
    (data): Manga & { width: number; height: number } => ({
      ...data,
      width: data.cover.width,
      height: data.cover.height,
    }),
  );

  return (
    <VirtualList datas={mangaList} rowGap={10} columnGap={10} name='mangaList'>
      {(e) => {
        return (
          <div>
            <div>
              <img src={imgUrl(e.name, 'cover.jpg')} />
            </div>
            <Button
              onClick={() => {
                navigage(`/detail/${e.name}/volumes`);
              }}
            >
              卷
            </Button>
            <Button
              onClick={() => {
                navigage(`/detail/${e.name}/chapters`);
              }}
            >
              话
            </Button>
          </div>
        );
      }}
    </VirtualList>
  );
};
