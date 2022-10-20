export interface Page {
  width: number;
  height: number;
  suffix: string;
}
type Unit = {
  pages: Page[];
};

export interface Manga {
  name: string;
  volumes: Unit[];
  chapters: Unit[];
  lastUpdate: number;
  isOver: boolean;
  fetchedAll: boolean;
  hasBeenCollected: boolean;
  hasBeenRead: boolean;
  cover: {
    width: number;
    height: number;
  };
}

export const fetchBase = 'https://192.168.0.117:8000';

export const imgUrl = (...paths: string[]) => {
  return encodeURI([fetchBase, 'imgs', ...paths].join('/'));
};
const optionBase = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export interface ReadPoint {
  mangaName: string;
  volumes: number;
  chapters: number;
}

export const fetchReadPoint = async (mangaName: string): Promise<ReadPoint> => {
  const res = await fetch(
    `${fetchBase}/readpoint?manga=${mangaName}`,
    optionBase,
  );
  return await res.json();
};

export const saveReadPoint = async (point: ReadPoint) => {
  const res = await fetch(`${fetchBase}/writepoint`, {
    headers: {
      'content-type': 'application/json',
    },
    method: 'post',
    body: JSON.stringify(point),
  });
  return await res.json();
};

export const fetchMangas = async (): Promise<Manga[]> => {
  const res = await fetch(`${fetchBase}/mangas`, optionBase);
  return (await res.json()) as Manga[];
};

export const delManga = async (mangaName: string): Promise<void> => {
  await fetch(`${fetchBase}/del/${mangaName}`, optionBase);
  return;
};

export const markMangaReaded = async (mangaName: string): Promise<any> => {
  await fetch(
    `${fetchBase}/markread/${mangaName}?readedStatus=true`,
    optionBase,
  );
  return;
};

export const markMangaUnReaded = async (mangaName: string): Promise<any> => {
  await fetch(
    `${fetchBase}/markread/${mangaName}?readedStatus=false`,
    optionBase,
  );
  return;
};

export const collectManga = async (mangaName: string): Promise<any> => {
  await fetch(`${fetchBase}/collect/${mangaName}?isCollect=true`, optionBase);
  return;
};
export const unCollectManga = async (mangaName: string): Promise<any> => {
  await fetch(`${fetchBase}/collect/${mangaName}?isCollect=false`, optionBase);
  return;
};
