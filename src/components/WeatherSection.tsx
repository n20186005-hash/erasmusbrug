'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { WEATHER_CONFIG } from '@/config/weather';
import {
  beaufort,
  classify,
  fetchWeatherBundle,
  type WeatherBundle,
  type WeatherDay,
  type WeatherKind,
} from '@/lib/weather';
import { buildAdvice, emptyAdvice, type AdviceCat, type AdviceResult } from '@/lib/weatherAdvice';

type Status = 'loading' | 'ready' | 'error';

/** 组件内部透传的最小化翻译器类型 */
type WeatherT = {
  (key: string, values?: Record<string, string | number>): string;
  raw: (key: string) => unknown;
};

const round1 = (n: number) => Math.round(n);
const round0 = (n: number) => Math.max(0, Math.round(n));

function intlLocale(locale: string): string {
  return locale === 'zh' ? 'zh-CN' : locale;
}

export default function WeatherSection() {
  const t = useTranslations('weather');
  const locale = useLocale();

  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchWeatherBundle();
      setBundle(data);
      setStatus('ready');
    } catch {
      setStatus('error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchWeatherBundle();
        if (alive) {
          setBundle(data);
          setStatus('ready');
        }
      } catch {
        if (alive) setStatus('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const today: WeatherDay | null = bundle?.days[0] ?? null;
  const advice: AdviceResult = useMemo(() => {
    if (!bundle || !today) return emptyAdvice();
    return buildAdvice(today, bundle.now);
  }, [bundle, today]);

  return (
    <section id="weather" className="section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {t('title')}
            </h2>
            <div className="w-12 h-0.5 mt-4" style={{ background: 'var(--accent)' }} />
            <p className="text-sm mt-4 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
              {t('subtitle')}
            </p>
          </div>
          <span
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full self-start sm:self-auto"
            style={{ background: 'var(--tag-bg)', color: 'var(--tag-text)' }}
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: status === 'ready' ? '#48bb78' : '#ecc94b' }}
            />
            {status === 'ready' ? t('labels.live') : t('labels.loadingShort')}
          </span>
        </div>

        {status === 'loading' && <Skeleton />}

        {status === 'error' && (
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
          >
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {t('labels.error')}
            </p>
            <button
              onClick={() => {
                void load();
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {t('labels.retry')}
            </button>
          </div>
        )}

        {status === 'ready' && bundle && today && (
          <div className="space-y-6">
            {/* 实况 + 7 日预报 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <NowCard
                t={t}
                bundle={bundle}
                today={today}
                refreshing={refreshing}
                onRefresh={() => void load()}
                hasWarning={advice.risks.length > 0}
              />
              <ForecastList t={t} bundle={bundle} locale={locale} />
            </div>

            {/* 智能建议区 */}
            <AdvicePanel t={t} advice={advice} />
          </div>
        )}
      </div>
    </section>
  );
}

/* ============ 实况卡片 ============ */

function NowCard({
  t,
  bundle,
  today,
  refreshing,
  onRefresh,
  hasWarning,
}: {
  t: WeatherT;
  bundle: WeatherBundle;
  today: WeatherDay;
  refreshing: boolean;
  onRefresh: () => void;
  hasWarning: boolean;
}) {
  const kind = classify(bundle.now.code);
  const updatedLabel = useMemo(() => {
    const d = new Date(bundle.now.time);
    return Number.isNaN(d.getTime())
      ? '--:--'
      : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }, [bundle.now.time]);

  const danger = today.precipProb !== null && today.precipProb >= 60;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--color-water-700), var(--color-water-800))',
        color: '#fff',
      }}
    >
      <div className="p-6 sm:p-7 flex flex-col gap-6 h-full">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <ConditionIcon kind={kind} size={52} light />
            <div>
              <p className="text-sm font-medium opacity-90">{t(`condition.${kind}`)}</p>
              <p className="font-display text-5xl leading-tight">
                {round1(bundle.now.temperature)}
                <span className="text-2xl align-top opacity-80">°</span>
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            aria-label={t('labels.refresh')}
            title={t('labels.refresh')}
            className="p-2 rounded-lg opacity-90 hover:opacity-100 transition disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.16)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? 'animate-spin' : ''}>
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <Metric
            label={t('labels.feels')}
            value={`${round1(bundle.now.apparent)}°`}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3a5 5 0 0 0-5 5c0 3 2 5 2 5h6s2-2 2-5a5 5 0 0 0-5-5z" /><path d="M9 17h6M10 20h4" /></svg>
            }
          />
          <Metric
            label={t('labels.precip')}
            value={today.precipProb === null ? '–' : `${round0(today.precipProb)}%`}
            tone={danger ? '#fbd38d' : undefined}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 14a4.5 4.5 0 1 1 2.6-8.1 5.5 5.5 0 0 1 10.2 2A3.5 3.5 0 0 1 18.5 14H7z" /><path d="M9.5 19c-.7 1 .7 2 0 3M13.5 19c-.7 1 .7 2 0 3" /></svg>
            }
          />
          <Metric
            label={t('labels.wind')}
            value={t('labels.windLine', {
              n: beaufort(bundle.now.windSpeed),
              speed: round1(bundle.now.windSpeed),
            })}
            small
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h9a3 3 0 1 0-3-3" /><path d="M3 12h15a3 3 0 1 1-3 3" /><path d="M3 16h6a2.5 2.5 0 1 1-2.5 2.5" /></svg>
            }
          />
          <Metric
            label={t('labels.uv')}
            value={today.uvMax === null ? '–' : uvWord(t, today.uvMax)}
            icon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            }
          />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 text-xs opacity-90">
          <span>
            {t('labels.updated')} {updatedLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: hasWarning ? '#f56565' : '#48bb78' }}
            />
            {hasWarning ? t('labels.hasWarning') : t('labels.noWarning')}
          </span>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  small,
  tone,
  icon,
}: {
  label: string;
  value: string;
  small?: boolean;
  tone?: string;
  icon: ReactNode;
}) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: 'rgba(255,255,255,0.12)' }}
    >
      <p className="text-[11px] opacity-80 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p
        className={`font-semibold mt-0.5 break-words ${small ? 'text-sm' : 'text-base'}`}
        style={tone ? { color: tone } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function uvWord(t: WeatherT, uv: number): string {
  if (uv < 3) return t('uv.low');
  if (uv < 6) return t('uv.moderate');
  if (uv < 8) return t('uv.high');
  if (uv < 11) return t('uv.veryHigh');
  return t('uv.extreme');
}

/* ============ 7 日预报 ============ */

function ForecastList({
  t,
  bundle,
  locale,
}: {
  t: WeatherT;
  bundle: WeatherBundle;
  locale: string;
}) {
  return (
    <div
      className="rounded-2xl p-6 sm:p-7 lg:col-span-3"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
          {t('labels.forecast')}
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {WEATHER_CONFIG.city} · {bundle.days.length} {t('labels.days')}
        </span>
      </div>
      <ul>
        {bundle.days.map((day, i) => (
          <ForecastRow key={day.date} t={t} day={day} index={i} locale={locale} />
        ))}
      </ul>
    </div>
  );
}

function ForecastRow({
  t,
  day,
  index,
  locale,
}: {
  t: WeatherT;
  day: WeatherDay;
  index: number;
  locale: string;
}) {
  const kind = classify(day.code);
  const name =
    index === 0
      ? t('labels.today')
      : index === 1
        ? t('labels.tomorrow')
        : new Date(`${day.date}T00:00:00`).toLocaleDateString(intlLocale(locale), {
            weekday: 'short',
          });

  const highlight = index === 0;

  return (
    <li
      className={`py-3 flex items-center gap-3 ${highlight ? 'px-2 -mx-2 rounded-lg' : ''}`}
      style={{
        ...(index > 0 ? { borderTop: '1px solid var(--border-color)' } : {}),
        ...(highlight ? { background: 'var(--bg-tertiary)' } : {}),
      }}
    >
      <span className="w-12 text-sm font-medium flex-shrink-0" style={{ color: highlight ? 'var(--accent)' : 'var(--text-secondary)' }}>
        {name}
      </span>
      <span className="flex items-center gap-2 flex-1 min-w-0" style={{ color: 'var(--text-primary)' }}>
        <ConditionIcon kind={kind} size={22} />
        <span className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
          {t(`condition.${kind}`)}
        </span>
      </span>
      <span className="text-sm whitespace-nowrap tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {round1(day.tMin)}° / <span style={{ color: 'var(--text-primary)' }}>{round1(day.tMax)}°</span>
      </span>
      <span
        className="w-12 text-right text-xs whitespace-nowrap tabular-nums flex-shrink-0"
        style={{ color: day.precipProb !== null && day.precipProb >= 60 ? '#e53e3e' : 'var(--text-muted)' }}
      >
        {day.precipProb === null ? '–' : `${round0(day.precipProb)}%`}
      </span>
    </li>
  );
}

/* ============ 智能建议区 ============ */

function AdvicePanel({
  t,
  advice,
}: {
  t: WeatherT;
  advice: AdviceResult;
}) {
  const linesFor = (cat: AdviceCat): string[] => {
    const out: string[] = [];
    for (const key of advice[cat]) {
      const raw = t.raw(`tips.${key}.${cat}`) as string[] | undefined;
      if (raw) out.push(...raw);
    }
    return [...new Set(out)];
  };

  const riskLines = advice.risks.flatMap((key) => {
    const raw = t.raw(`tips.${key}.risk`) as string[] | undefined;
    return raw ?? [];
  });

  const blocks: Array<{ cat: AdviceCat; icon: ReactNode; title: string }> = [
    { cat: 'outfit', title: t('labels.outfit'), icon: <ShirtIcon /> },
    { cat: 'play', title: t('labels.play'), icon: <MapIcon /> },
    { cat: 'gear', title: t('labels.gear'), icon: <BagIcon /> },
  ];

  return (
    <div className="rounded-2xl p-6 sm:p-7" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <h3 className="font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <SparkIcon />
          {t('labels.advice')}
        </h3>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {t('labels.disclaimer')}
        </span>
      </div>

      {advice.risks.length > 0 && (
        <div
          className="rounded-xl px-4 py-3.5 mb-5 border border-red-700/20"
          style={{ background: 'rgba(229,62,62,0.08)' }}
          role="alert"
        >
          <p className="text-sm font-semibold flex items-center gap-2 mb-1.5" style={{ color: '#c53030' }}>
            <WarningIcon />
            {t('labels.risk')}
          </p>
          {riskLines.map((line) => (
            <p key={line} className="text-sm leading-relaxed" style={{ color: '#9b2c2c' }}>
              {line}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {blocks.map((block) => {
          const lines = linesFor(block.cat);
          if (lines.length === 0) return null;
          return (
            <div
              key={block.cat}
              className="rounded-xl p-5"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--accent)' }}>
                {block.icon}
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {block.title}
                </h4>
              </div>
              <ul className="space-y-2">
                {lines.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span className="mt-[7px] flex-shrink-0 inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ 加载骨架 ============ */

function Skeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 rounded-2xl p-7 space-y-5 lg:min-h-[300px]" style={{ background: 'var(--color-water-700)', border: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-4">
          <div className="w-[52px] h-[52px] rounded-full bg-white/25 animate-pulse" />
          <div className="space-y-2">
            <div className="w-24 h-4 rounded bg-white/25 animate-pulse" />
            <div className="w-16 h-8 rounded bg-white/25 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/20 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-3 rounded-2xl p-6 sm:p-7" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <div className="w-28 h-5 rounded bg-current opacity-10 animate-pulse mb-6" />
        <div className="space-y-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 rounded-lg bg-current opacity-5 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============ SVG 图标 ============ */

function ConditionIcon({ kind, size, light }: { kind: WeatherKind; size: number; light?: boolean }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: light ? '#fff' : 'var(--accent)', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  if (kind === 'clear') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    );
  }
  if (kind === 'partly' || kind === 'cloudy') {
    return (
      <svg {...common}>
        <circle cx="7" cy="8" r="3" fill={light ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)'} />
        <path d="M7 3v1M3.2 4.2l.7.7M10.8 4.2l-.7.7" />
        <path d="M18 17a4.5 4.5 0 0 0-2.2-8.4A5.2 5.2 0 0 0 6.4 8.6 3.6 3.6 0 0 0 7 15.5h11z" />
      </svg>
    );
  }
  if (kind === 'overcast') {
    return (
      <svg {...common}>
        <path d="M18 17a4.5 4.5 0 0 0-2.2-8.4A5.2 5.2 0 0 0 6.4 8.6 3.6 3.6 0 0 0 7 15.5h11z" />
        <path d="M6 20h12" />
      </svg>
    );
  }
  if (kind === 'fog') {
    return (
      <svg {...common}>
        <path d="M4 6h12M4 10h16M4 14h12M4 18h16" />
      </svg>
    );
  }
  if (kind === 'drizzle' || kind === 'lightRain' || kind === 'rain') {
    return (
      <svg {...common}>
        <path d="M18 15a4.5 4.5 0 0 0-2.2-8.4A5.2 5.2 0 0 0 6.4 8.6 3.6 3.6 0 0 0 7 15.5h11z" />
        {kind === 'rain' ? (
          <path d="M9 18l-1 3M15 18l-1 3M12 19l-1 3M18 19l-1 3" />
        ) : (
          <path d="M9 18l-1 2M14 19l-1 2" />
        )}
      </svg>
    );
  }
  if (kind === 'heavyRain' || kind === 'sleet') {
    return (
      <svg {...common}>
        <path d="M18 15a4.5 4.5 0 0 0-2.2-8.4A5.2 5.2 0 0 0 6.4 8.6 3.6 3.6 0 0 0 7 15.5h11z" />
        <path d="M9 18l-1.5 3M14 19l-1.5 3M18 18l-1.5 3" />
      </svg>
    );
  }
  if (kind === 'snow' || kind === 'snowShower') {
    return (
      <svg {...common}>
        <path d="M18 15a4.5 4.5 0 0 0-2.2-8.4A5.2 5.2 0 0 0 6.4 8.6 3.6 3.6 0 0 0 7 15.5h11z" />
        <path d="M10 19v2M15 19v2M12.5 20.5l-1.5 1M12.5 20.5l1.5 1" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M18 15a4.5 4.5 0 0 0-2.2-8.4A5.2 5.2 0 0 0 6.4 8.6 3.6 3.6 0 0 0 7 15.5h11z" />
      <path d="M13 11l-3 4h3l-2 4" />
    </svg>
  );
}

function ShirtIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.4 3.5 16 2l-1.5 2.4A2 2 0 0 1 13 5.4 2 2 0 0 1 9.5 4.4L8 2 3.6 3.5a1 1 0 0 0-.7 1l1.1 4.4a1 1 0 0 0 .9.8L7 9.7V22h10V9.7l2.1-.1a1 1 0 0 0 .9-.8l1.1-4.4a1 1 0 0 0-.7-1z" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3" />
      <path d="M12 2a8 8 0 0 0-8 8c0 5.3 8 12 8 12s8-6.7 8-12a8 8 0 0 0-8-8z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8h12l1.5 12.5a1 1 0 0 1-1 1.5H5.5a1 1 0 0 1-1-1.5L6 8z" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--accent)' }}>
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}
