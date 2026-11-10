// Display-only additions: the source report files and their text hashes stay unchanged.
const assets = '/assets/posts/ezekiel-2-1-3-11';
export const isaiahImages = [
  {
    report: 1, id: 'babylon-cylinder', heading: 'N. ANE Historical Comparanda',
    filename: '02-nebuchadnezzar-cylinder-met-86-11-60-original.jpg', width: 3895, height: 2318,
    alt: 'Nebuchadnezzar II’s clay cylinder bearing cuneiform writing',
    caption: 'Clay cylinder recording Nebuchadnezzar II’s outer wall at Babylon (c. 604–562 BCE). Comparative evidence for imperial building and royal record-keeping, rather than the Cyrus Cylinder or a depiction of Isaiah’s events. The Metropolitan Museum of Art, 86.11.60, Purchase, 1886.',
    source: 'https://www.metmuseum.org/art/collection/search/321676',
    rights: 'Public Domain / CC0', license: 'https://creativecommons.org/publicdomain/zero/1.0/'
  },
  {
    report: 3, id: 'babylon-map', heading: 'A. Exilic / Return Social-Historical Map',
    filename: '03-babylon-city-map-commons.png', width: 800, height: 694,
    alt: 'Modern map of Babylon showing the Euphrates, major buildings, and walls',
    caption: 'Modern plan of Babylon’s principal sites. It includes a later Greek theater and is not a precise reconstruction of one exilic moment or a deportation-and-return route map. Jona Lendering / Livius.org, Wikimedia Commons. Unchanged.',
    source: 'https://commons.wikimedia.org/wiki/File:Babylon_map.png',
    rights: 'CC BY-SA 3.0', license: 'https://creativecommons.org/licenses/by-sa/3.0/'
  },
  {
    report: 3, id: 'babylon-lion', heading: 'F. Empire–God–Community Power Matrix',
    filename: '01-babylon-lion-met-31-13-2.jpg', width: 3811, height: 1656,
    alt: 'Lion relief on blue glazed brick from Babylon’s Processional Way',
    caption: 'Lion relief from Babylon’s Processional Way (c. 604–562 BCE), illustrating urban ritual and imperial religious symbolism rather than directly depicting Isaiah 43’s wild creatures. The Metropolitan Museum of Art, 31.13.2, Fletcher Fund, 1931.',
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
    const figure = `<figure data-isaiah-image="${item.id}"><img src="${assets}/${item.filename}" width="${item.width}" height="${item.height}" alt="${item.alt}" loading="lazy" decoding="async"><figcaption>${item.caption} <a href="${item.source}" target="_blank" rel="noopener noreferrer">Original source</a> · <a href="${item.license}" target="_blank" rel="noopener noreferrer">${item.rights}</a></figcaption></figure>`;
    const index = paragraphEnd + 4;
    html = html.slice(0, index) + figure + html.slice(index);
  }
  return html;
}
