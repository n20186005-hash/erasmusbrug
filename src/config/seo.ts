import { site, BASE_URL } from './site';

type FAQItem = { q: string; a: string };

/** 结构化数据：TouristAttraction（对应 Google 知识面板实体） */
export function buildTouristAttractionJsonLd(opts: { description: string }) {
  const { description } = opts;
  const image = `${BASE_URL}${site.heroImage}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    '@id': `${BASE_URL}/#attraction`,
    name: site.fullName,
    alternateName: [
      site.shortName,
      site.nickname,
      site.nicknameLocal,
      `${site.city} ${site.fullName}`,
    ],
    description,
    url: BASE_URL,
    image: [image],
    isAccessibleForFree: true,
    publicAccess: true,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.fullName,
      addressLocality: site.city,
      addressRegion: site.state,
      postalCode: site.postalCode,
      addressCountry: site.countryCode,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.latitude,
      longitude: site.longitude,
    },
    hasMap: site.mapsShareUrl,
    sameAs: [site.mapsShareUrl, site.govtTourismUrl],
  };
}

/** 结构化数据：FAQPage（由可视化 FAQ 内容同步生成） */
export function buildFaqJsonLd(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}
