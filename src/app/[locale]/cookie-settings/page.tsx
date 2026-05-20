import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import CookieSettingsClient from './CookieSettingsClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const baseUrl = 'https://greatyarmouthbeach.com';
  const itUrl = `${baseUrl}/cookie-settings`;
  const enUrl = `${baseUrl}/en/cookie-settings`;
  const frUrl = `${baseUrl}/fr/cookie-settings`;
  const zhUrl = `${baseUrl}/zh-Hant/cookie-settings`;

  return {
    alternates: {
      canonical: itUrl,
      languages: {
        'it': itUrl,
        'en': enUrl,
        'fr': frUrl,
        'zh-Hant': zhUrl,
        'x-default': itUrl,
      },
    },
  };
}

export default async function CookiePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CookieSettingsClient />;
}
