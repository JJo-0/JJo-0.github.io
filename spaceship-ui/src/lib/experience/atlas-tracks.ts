// Paths refer to the static audio files under site/assets/audio/atlas/.
export interface AtlasTrack {
  id: string;
  title: string;
  credit: string;
  src: string;
  license: string;
  sourceUrl?: string;
  licenseUrl?: string;
}

export function getAtlasTracks(en: boolean): AtlasTrack[] {
  const original = en ? 'Original synthesis' : '직접 합성한 음원';
  return [
    {
      id: 'afterglow-studies',
      title: 'Afterglow Studies',
      credit: en
        ? 'Writing Atlas · Electric piano, bass and drums'
        : 'Writing Atlas · 전자피아노, 베이스, 드럼',
      license: original,
    },
    {
      id: 'soft-rain',
      title: en ? 'Soft rain' : '잔잔한 빗소리',
      credit: en ? 'Writing Atlas · Synthesized rain' : 'Writing Atlas · 빗방울과 배경 빗소리 합성',
      license: original,
    },
    {
      id: 'brown-noise',
      title: en ? 'Brown noise' : '브라운 노이즈',
      credit: en ? 'Writing Atlas · Filtered noise' : 'Writing Atlas · 저음 중심의 노이즈 합성',
      license: original,
    },
    {
      id: 'goldberg-aria',
      title: en ? 'Goldberg Variations · Aria' : '골드베르크 변주곡 · 아리아',
      credit: en
        ? 'J. S. Bach · Kimiko Ishizaka, piano'
        : 'J. S. 바흐 · 피아노 연주 이시자카 기미코',
      license: 'CC0 1.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Goldberg_Variations_BWV_988_01_Aria.flac',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    },
  ].map((track) => ({ ...track, src: '/audio/atlas/' + track.id + '.mp3' }));
}
