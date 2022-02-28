export interface VolumeSuffix {
  main: string;
  other: {
    suffix: string;
    seqs: number[];
  }[];
}

export type Volume = [string, number, VolumeSuffix];

export interface Manga {
  name: string;
  cover: string;
  volumes: Volume[];
}

export const fetchBase = 'https://192.168.0.106:8000';
const optionBase = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export interface ReadPoint {
  mangaName: string;
  volumeName: string;
  pageSeq: number;
}

export const fetchReadPoint = async (
  mangaName: string,
): Promise<ReadPoint | null> => {
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

export interface Manga {
  name: string;
  cover: string;
  total: number;
}

export const fetchMangas = async (): Promise<Manga[]> => {
  const res = await fetch(`${fetchBase}/mangas`, optionBase);
  return ((await res.json()) as Manga[]).map((e) => ({
    ...e,
    cover: `${fetchBase}/${e.cover}`,
  }));
};

export interface NickContent {
  popularity: number;
  updateTime: string;
  url: string;
  pageCount: number;
  canSeeAll: boolean;
  is3D: boolean;
  part: number;
}
export interface NickBook {
  name: string;
  author: string;
  content: NickContent[];
  cover: string;
  hasDownload: boolean;
}

export const fetchNicks = async (): Promise<NickBook[]> => {
  const res = await fetch(`${fetchBase}/nicks`, optionBase);
  const t = (await res.json()) as NickBook[];
  return t.map((e) => ({
    ...e,
    cover: `${fetchBase}${e.cover || `/nickCover/${e.content[0].url}`}`,
  }));
};

export const delManga = async (mangaName: string): Promise<void> => {
  await fetch(`${fetchBase}/del/${mangaName}`, optionBase);
  return;
};
export const downloadNicks = async (
  name: string,
  url: string,
): Promise<any> => {
  return await fetch(
    `${fetchBase}/download?name=${name}&url=${url}`,
    optionBase,
  );
};
