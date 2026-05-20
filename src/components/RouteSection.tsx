'use client';

import { useTranslations } from 'next-intl';

export default function RouteSection() {
  const t = useTranslations('route');

  return (
    <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-8" style={{ background: 'var(--accent)' }} />

        <p className="text-lg leading-relaxed mb-10" style={{ color: 'var(--text-secondary)' }}>
          {t('overview')}
        </p>

        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-6 top-0 bottom-0 w-0.5"
            style={{ background: 'var(--border-color)' }}
          />

          <div className="space-y-6">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((step) => (
              <RouteStep
                key={step}
                step={step}
                description={t(`steps.${step - 1}` as any)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RouteStep({ step, description }: { step: number; description: string }) {
  return (
    <div className="relative flex gap-4 pl-4">
      {/* Timeline dot */}
      <div
        className="absolute left-4 -translate-x-1/2 w-4 h-4 rounded-full border-2 flex-shrink-0"
        style={{
          background: 'var(--accent)',
          borderColor: 'var(--accent)',
          top: '0.25rem',
        }}
      />

      {/* Step number */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ background: 'var(--accent)', color: 'white' }}
      >
        {step}
      </div>

      {/* Content */}
      <div
        className="flex-1 rounded-xl p-4"
        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>
    </div>
  );
}
