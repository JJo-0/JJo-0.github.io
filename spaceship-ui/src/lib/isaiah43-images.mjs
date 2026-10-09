// Display-only additions: the source report files and their text hashes stay unchanged.
const assets = '/assets/posts/ezekiel-2-1-3-11';
export const isaiahImages = [
  {
    report: 1, id: 'babylon-cylinder', heading: 'N. ANE Historical Comparanda',
    filename: '02-nebuchadnezzar-cylinder-met-86-11-60-original.jpg', width: 3895, height: 2318,
    alt: '설형문자로 기록한 느부갓네살 2세의 점토 원통',
    caption: '느부갓네살 2세의 바빌론 외성 건축을 기록한 점토 원통(기원전 약 604–562년). 고대 제국의 건축과 왕권 기록을 보여 주는 비교 자료이며, 이사야 본문의 사건 자체나 고레스 원통을 나타낸 것은 아닙니다. The Metropolitan Museum of Art, 86.11.60, Purchase, 1886.',
    source: 'https://www.metmuseum.org/art/collection/search/321676',
    rights: 'Public Domain / CC0', license: 'https://creativecommons.org/publicdomain/zero/1.0/'
  },
  {
    report: 3, id: 'babylon-map', heading: 'A. Exilic / Return Social-Historical Map',
    filename: '03-babylon-city-map-commons.png', width: 800, height: 694,
    alt: '유프라테스강과 바빌론의 주요 건물·성벽을 표시한 현대 지도',
    caption: '바빌론 주요 유적의 현대 도시 배치도. 후대 그리스 극장도 포함하므로 포로기 한 시점의 정밀 복원도나 유수·귀환 경로 지도가 아닙니다. Jona Lendering / Livius.org, Wikimedia Commons. 변경 없음.',
    source: 'https://commons.wikimedia.org/wiki/File:Babylon_map.png',
    rights: 'CC BY-SA 3.0', license: 'https://creativecommons.org/licenses/by-sa/3.0/'
  },
  {
    report: 3, id: 'babylon-lion', heading: 'F. Empire–God–Community Power Matrix',
    filename: '01-babylon-lion-met-31-13-2.jpg', width: 3811, height: 1656,
    alt: '푸른 유약 벽돌 위에 표현된 바빌론 행렬길의 사자 부조',
    caption: '바빌론 행렬길의 사자 부조(기원전 약 604–562년). 도시의 의례와 제국의 종교적 상징을 보여 주는 유물입니다. 이사야 43장의 들짐승을 직접 묘사한 자료는 아닙니다. The Metropolitan Museum of Art, 31.13.2, Fletcher Fund, 1931.',
    source: 'https://www.metmuseum.org/art/collection/search/322586',
    rights: 'Public Domain / CC0', license: 'https://creativecommons.org/publicdomain/zero/1.0/'
  }
];
export function illustrateIsaiahReport(html, report) {
  for (const item of isaiahImages.filter(image => image.report === report)) {
    const heading = `<h2>${item.heading}</h2>`;
    const start = html.indexOf(heading);
    const paragraphEnd = html.indexOf('</p>', start + heading.length);
    const nextHeading = html.indexOf('<h2>', start + heading.length);
    if (start < 0 || paragraphEnd < 0 || (nextHeading >= 0 && paragraphEnd > nextHeading)) throw new Error(`Isaiah image placement changed: ${item.id}`);
    const figure = `<figure data-isaiah-image="${item.id}"><img src="${assets}/${item.filename}" width="${item.width}" height="${item.height}" alt="${item.alt}" loading="lazy" decoding="async"><figcaption>${item.caption} <a href="${item.source}" target="_blank" rel="noopener noreferrer">원출처</a> · <a href="${item.license}" target="_blank" rel="noopener noreferrer">${item.rights}</a></figcaption></figure>`;
    const index = paragraphEnd + 4;
    html = html.slice(0, index) + figure + html.slice(index);
  }
  return html;
}
