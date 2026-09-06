'use client';

import { useTranslations } from 'next-intl';

type FaqItem = { q: string; a: string };

export default function FaqSection() {
  const t = useTranslations('faq');
  const items = (t.raw('items') as FaqItem[] | undefined) ?? [];

  if (items.length === 0) return null;

  return (
    <section id="faq" className="section-padding">
      <div className="max-w-4xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-6" style={{ background: 'var(--accent)' }} />
        <p className="text-sm mb-10 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
          {t('subtitle')}
        </p>

        <div className="space-y-3">
          {items.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl overflow-hidden"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none">
                <span
                  className="text-sm sm:text-base font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {item.q}
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                  style={{ color: 'var(--accent)' }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="px-5 pb-4">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {item.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
