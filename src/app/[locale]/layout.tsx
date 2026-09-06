import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata, Viewport } from 'next';
import PwaRegister from '@/components/PwaRegister';
import { site, BASE_URL, absUrl, languageAlternates, HTML_LANG, OG_LOCALE } from '@/config/site';
import { buildTouristAttractionJsonLd, buildFaqJsonLd } from '@/config/seo';

type Messages = {
  meta?: { title?: string; description?: string };
  faq?: {
    title?: string;
    subtitle?: string;
    items?: Array<{ q: string; a: string }>;
  };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`@/messages/${locale}.json`)).default as Messages;
  const title = messages?.meta?.title ?? site.fullName;
  const description = messages?.meta?.description ?? '';
  const selfUrl = absUrl(locale);
  const ogImage = `${BASE_URL}${site.heroImage}`;
  const ogLocale = OG_LOCALE[locale as keyof typeof OG_LOCALE] ?? 'en_US';

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    applicationName: site.siteName,
    alternates: {
      canonical: selfUrl,
      languages: languageAlternates(),
    },
    openGraph: {
      title,
      description,
      url: selfUrl,
      siteName: site.siteName,
      locale: ogLocale,
      type: 'website',
      images: [
        {
          url: ogImage,
          alt: `${site.fullName} in ${site.city}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    icons: {
      icon: [
        { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: site.fullName,
      statusBarStyle: 'default',
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      'geo.region': 'NL-ZH',
      'geo.placename': `${site.city} ${site.stateLocal}`,
      'geo.position': `${site.latitude};${site.longitude}`,
      ICBM: `${site.latitude}, ${site.longitude}`,
    },
  };
}

export const viewport: Viewport = {
  themeColor: site.themeColor,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = (await getMessages()) as Messages & Record<string, unknown>;

  // ---- 结构化数据：TouristAttraction ----
  const touristAttractionJsonLd = JSON.stringify(
    buildTouristAttractionJsonLd({
      description: messages?.meta?.description ?? '',
    })
  );

  // ---- 结构化数据：FAQPage（与页面可见 FAQ 保持一致）----
  const faqItems = messages?.faq?.items ?? [];
  const faqJsonLd =
    faqItems.length > 0 ? JSON.stringify(buildFaqJsonLd(faqItems)) : '';

  const ga4Id = site.ga4Id;

  return (
    <html lang={HTML_LANG[locale as keyof typeof HTML_LANG] ?? 'en'} suppressHydrationWarning>
      <head>
        {site.adsenseClient && (
          <>
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseClient}`}
              crossOrigin="anonymous"
            />
            <meta name="google-adsense-account" content={site.adsenseClient} />
          </>
        )}

        {/* Google Analytics 4 */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}');
            `,
          }}
        />

        {/* Schema.org - TouristAttraction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: touristAttractionJsonLd }}
        />
        {/* Schema.org - FAQPage */}
        {faqJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: faqJsonLd }}
          />
        )}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
