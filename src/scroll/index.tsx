import { useParams } from 'react-router-dom';
import { VirtualList } from '../virutal-list';
import { useMangaData } from '../provider/mangas';
import { imgUrl } from '../service/fetch-interface';

export const Scroll = () => {
  const { getPages } = useMangaData();
  const { mangaName, type } = useParams<{
    mangaName: string;
    type: 'chapters' | 'volumes';
  }>();
  //   const { readPoint, seq, updatePoint } = useReadPoint(
  //     mangaName ?? '',
  //     type ?? 'chapters',
  //   );

  const pages = getPages(mangaName ?? '', type ?? 'chapters');

  if (!pages || !mangaName || !type) {
    return null;
  }

  return (
    <VirtualList datas={pages} name='scrollDetail'>
      {(e, seq) => {
        return (
          <img
            src={imgUrl(
              mangaName,
              type,
              String(seq + 1).padStart(5, '0') + '.' + e.suffix,
            )}
            style={{ maxWidth: '100%', height: 'auto' }}
            alt={String(seq + 1).padStart(5, '0')}
          />
        );
      }}
    </VirtualList>
  );
};
