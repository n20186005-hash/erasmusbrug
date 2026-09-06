import type { MetadataRoute } from 'next';
import { LOCALES, absUrl, languageAlternates } from '@/config/site';

const LEGAL_ROUTES = [
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms-of-service', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cookie-settings', changeFrequency: 'yearly', priority: 0.2 },
] as const;

/**
 * 多语言站点地图：
 * 每个 locale 的首页 + 法律页，并为每个 URL 生成 hreflang 语言替代集。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: absUrl(locale),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: { languages: languageAlternates() },
    });

    for (const route of LEGAL_ROUTES) {
      entries.push({
        url: absUrl(locale, route.path),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages: languageAlternates(route.path) },
      });
    }
  }

  return entries;
}
