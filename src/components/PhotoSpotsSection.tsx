'use client';

import { useTranslations, useMessages } from 'next-intl';

export default function PhotoSpotsSection() {
  const t = useTranslations('photoSpots');
  const messages = useMessages() as any;
  const spots = (messages?.photoSpots?.spots || []) as Array<{ name: string; desc: string }>;

  return (
    <section className="section-padding">
      <div className="max-w-5xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-10" style={{ background: 'var(--accent)' }} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot, index) => (
            <PhotoSpotCard
              key={index}
              name={spot.name}
              description={spot.desc}
              index={index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PhotoSpotCard({ name, description, index }: { name: string; description: string; index: number }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
    >
      {/* Placeholder image area */}
      <div
        className="aspect-video flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary))' }}
      >
        <div className="text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" className="mx-auto mb-2 opacity-50">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span className="text-4xl font-bold opacity-20" style={{ color: 'var(--accent)' }}>
            {index}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {name}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>
    </div>
  );
}
