/**
 * ============================================================
 * Single-Attraction SEO Entity Configuration
 * 单景点 SEO 实体绑定配置变量表
 *
 * Replace the values below (or set the NEXT_PUBLIC_SITE_URL env
 * variable at build/deploy time) to rebrand this template for
 * another attraction. All Schema.org JSON-LD, TDK/OG tags,
 * canonical URLs, maps embedding and body copy read from here.
 * ============================================================
 */

// {{DOMAIN_NAME}} & website base URL
export const SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_DOMAIN ?? 'erasmusbrug.com';

export const BASE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_DOMAIN}`).replace(/\/+$/, '');

export const DEFAULT_LOCALE = 'en';

export const LOCALES = ['zh', 'en', 'nl', 'de', 'fr', 'es', 'it'] as const;

export const site = {
  // {{ATTRACTION_FULL_NAME}} - 景点官方全称
  fullName: 'Erasmusbrug',
  // {{ATTRACTION_SHORT_NAME}} - 俗称 / 域名含义（英文惯用名）
  shortName: 'Erasmus Bridge',
  // 本地昵称（google 简介中 "known locally as 'The Swan'"）
  nickname: 'The Swan',
  nicknameLocal: 'De Zwaan',

  // 行政归属
  city: 'Rotterdam', // {{CITY_NAME}}
  state: 'South Holland', // {{STATE_PROVINCE}}
  stateLocal: 'Zuid-Holland',
  country: 'Netherlands', // {{COUNTRY_NAME}}
  countryCode: 'NL', // {{COUNTRY_CODE_2LETTER}}
  postalCode: '3011 BN', // {{POSTAL_CODE}}
  streetAddress: 'Erasmusbrug, 3011 BN Rotterdam, Netherlands',

  // 地理坐标 {{LATITUDE}} / {{LONGITUDE}}（取自 Google Maps 嵌入）
  latitude: 51.909004,
  longitude: 4.4871227,

  // Google 知识面板数据（评分仅用于展示参考，不做 reviews schema）
  rating: '4.7',
  reviewCount: '16,598',

  // {{MAPS_SHARE_URL}} 与 {{MAPS_EMBED_SRC}}
  mapsShareUrl: 'https://maps.app.goo.gl/ACjWcvd1rFhRxPgy7',
  mapsEmbedSrc:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4211.246131666253!2d4.4871227!3d51.909003999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c43366a91d4f5b%3A0xf43b51dff4165c58!2sErasmusbrug!5e1!3m2!1sen!2s!4v1788709276921!5m2!1sen!2s',

  // {{NEARBY_LANDMARK_1}} / {{NEARBY_LANDMARK_2}}
  landmarks: ['Euromast', 'SS Rotterdam'],

  // {{GOVT_TOURISM_URL}} - 官方/旅游局权威链接
  govtTourismUrl:
    'https://www.rotterdam.info/en/visit/finder-locations/erasmusbrug',

  // Hero / 卡片主图（图片版权归原摄影者所有）
  heroImage: '/gallery/erasmusbrug-1.jpg',

  // 品牌 / PWA / OG 名称
  siteName: 'Erasmusbrug Visitor Guide',
  themeColor: '#2d6375',
  ga4Id: 'G-HXM22WWPKP',
  // Google AdSense 发布商 ID；未配置（空字符串）时不注入 AdSense 脚本
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '',
} as const;

export type AppLocale = (typeof LOCALES)[number];

/** locale code → `<html lang>` attribute 值 */
export const HTML_LANG: Record<AppLocale, string> = {
  zh: 'zh-CN',
  en: 'en',
  nl: 'nl',
  de: 'de',
  fr: 'fr',
  es: 'es',
  it: 'it',
};

/** locale code → Open Graph `og:locale` 值 */
export const OG_LOCALE: Record<AppLocale, string> = {
  zh: 'zh_CN',
  en: 'en_US',
  nl: 'nl_NL',
  de: 'de_DE',
  fr: 'fr_FR',
  es: 'es_ES',
  it: 'it_IT',
};

/** `/zh`、`/en`、`/nl` 等带语言前缀的本地链接 */
export function localizedHref(locale: string, path = ''): string {
  const base = `/${locale}`;
  if (!path) return base;
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

/** 语言的绝对地址 */
export function absUrl(locale: string, path = ''): string {
  return `${BASE_URL}${localizedHref(locale, path)}`;
}

/** 供 generateMetadata alternates.languages 使用 */
export function languageAlternates(path = '') {
  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = absUrl(loc, path);
  }
  languages['x-default'] = absUrl(DEFAULT_LOCALE, path);
  return languages;
}
