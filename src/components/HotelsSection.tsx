'use client';

import { useTranslations, useMessages } from 'next-intl';

export default function HotelsSection() {
  const t = useTranslations('hotels');
  const messages = useMessages() as any;
  const hotels = (messages?.hotels?.hotels || []) as Array<{ name: string; desc: string; price: string }>;

  return (
    <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-10" style={{ background: 'var(--accent)' }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hotels.map((hotel, index) => (
            <HotelCard
              key={index}
              name={hotel.name}
              description={hotel.desc}
              price={hotel.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function HotelCard({ name, description, price }: { name: string; description: string; price: string }) {
  return (
    <div
      className="rounded-xl p-6 flex gap-4"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'var(--accent)', color: 'white' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
          <path d="M9 9v.01"/>
          <path d="M9 12v.01"/>
          <path d="M9 15v.01"/>
          <path d="M9 18v.01"/>
        </svg>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {name}
          </h3>
          <span
            className="text-sm font-medium flex-shrink-0"
            style={{ color: 'var(--accent)' }}
          >
            {price}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>
    </div>
  );
}
