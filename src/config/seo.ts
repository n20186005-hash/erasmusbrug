import type { Metadata } from 'next';
import { site, BASE_URL, absUrl, languageAlternates, OG_LOCALE } from './site';

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

type LegalDoc = {
  title?: string;
  description?: string;
  sections?: Array<{ heading?: string; content?: string }>;
};

/**
 * 法律类页面(privacy/terms/cookieSettings)的本地化 SEO 元数据。
 * title/description 取自对应语言的 messages，并生成 canonical 与 hreflang。
 */
export async function buildLegalPageMetadata(opts: {
  locale: string;
  path: string;
  docKey: 'privacy' | 'terms' | 'cookieSettings';
  fallbackTitle: string;
}): Promise<Metadata> {
  const { locale, path, docKey, fallbackTitle } = opts;
  const messages = (await import(`@/messages/${locale}.json`)).default as {
    [key: string]: LegalDoc | undefined;
  };
  const doc = messages?.[docKey] ?? {};
  const rawTitle = doc?.title ?? fallbackTitle;
  const title = `${rawTitle} · ${site.siteName}`;

  let description = doc?.description ?? '';
  if (!description) {
    const firstSection = doc?.sections?.[0]?.content ?? '';
    description =
      firstSection.length > 150 ? `${firstSection.slice(0, 150).trimEnd()}…` : firstSection;
  }

  const url = absUrl(locale, path);
  const ogLocale = OG_LOCALE[locale as keyof typeof OG_LOCALE] ?? 'en_US';

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url,
      locale: ogLocale,
      type: 'website',
    },
  };
}
