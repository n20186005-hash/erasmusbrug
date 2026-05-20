'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { useState, useRef, useEffect } from 'react';

const labels: Record<string, string> = {
  zh: '中文',
  en: 'English',
  nl: 'Nederlands',
};

export default function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function switchLocale(next: Locale) {
    setOpen(false);
    
    // 如果当前已经在目标语言，不执行任何操作
    if (next === locale) return;

    const segments = pathname.split('/').filter(Boolean);
    
    // Remove current locale prefix if present
    if (routing.locales.includes(segments[0] as Locale)) {
      segments.shift();
    }
    
    // Construct new path - always add locale prefix for mode: 'always'
    const pathWithoutLocale = segments.length > 0 ? `/${segments.join('/')}` : '/';
    
    // Navigate - always include locale prefix
    const newPath = `/${next}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
    router.push(newPath);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        style={{
          background: 'var(--tag-bg)',
          color: 'var(--tag-text)',
        }}
        aria-label="Switch language"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        {labels[locale]}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg overflow-hidden z-50"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors"
              style={{
                color: loc === locale ? 'var(--accent)' : 'var(--text-primary)',
                fontWeight: loc === locale ? 600 : 400,
                background: 'transparent',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {labels[loc]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
