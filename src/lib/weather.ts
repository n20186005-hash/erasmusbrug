import { WEATHER_CONFIG } from '@/config/weather';

/* ============================================================
 * 天气数据层：Open-Meteo 免 Key 接口 -> 统一领域模型
 * 天气码：https://open-meteo.com/en/docs (WMO Weather interpretation codes)
 * ============================================================ */

export type WeatherKind =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'lightRain'
  | 'rain'
  | 'heavyRain'
  | 'sleet'
  | 'snow'
  | 'snowShower'
  | 'thunder';

export interface WeatherNow {
  /** ISO 观测时间 */
  time: string;
  code: number;
  isDay: boolean;
  temperature: number;
  apparent: number;
  windSpeed: number;
  windGust: number;
}

export interface WeatherDay {
  date: string; // yyyy-mm-dd（按目标时区）
  code: number;
  tMax: number;
  tMin: number;
  precipProb: number | null; // 降水概率 %
  uvMax: number | null; // 紫外线指数（当日最大值）
  windMax: number; // 当日最大风速 km/h
  gustMax: number;
}

export interface WeatherBundle {
  fetchedAt: number;
  now: WeatherNow;
  days: WeatherDay[];
}

/** 依据 WMO 天气码做口语化分类（用于文案与图标） */
export function classify(code: number): WeatherKind {
  if (code === 0) return 'clear';
  if (code === 1) return 'partly';
  if (code === 2) return 'cloudy';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 55) return 'drizzle';
  if (code === 56 || code === 57 || code === 66 || code === 67) return 'sleet';
  if (code === 61 || code === 80) return 'lightRain';
  if (code === 63 || code === 81) return 'rain';
  if (code === 65 || code === 82) return 'heavyRain';
  if (code === 71 || code === 73 || code === 75 || code === 77) return 'snow';
  if (code === 85 || code === 86) return 'snowShower';
  if (code >= 95) return 'thunder';
  return 'clear';
}

/** 风速(km/h) -> 蒲福风级 */
export function beaufort(kmh: number): number {
  const table = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118, 200];
  let b = 0;
  while (kmh >= table[b] && b < table.length - 1) b++;
  return b;
}

/** 是否降雨类天气 */
export function isRainyKind(kind: WeatherKind): boolean {
  return (
    kind === 'drizzle' ||
    kind === 'lightRain' ||
    kind === 'rain' ||
    kind === 'heavyRain' ||
    kind === 'sleet'
  );
}

/** 是否强降雨 / 雷雨 */
export function isHeavyKind(kind: WeatherKind): boolean {
  return kind === 'heavyRain' || kind === 'thunder';
}

/** 从 WMO 码判断是否雷雨 */
export function isThunderCode(code: number): boolean {
  return code >= 95;
}

/** 从 WMO 码判断是否强降雨 */
export function isHeavyRainCode(code: number): boolean {
  return code === 65 || code === 82;
}

export function isFogCode(code: number): boolean {
  return code === 45 || code === 48;
}

const BASE = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoResponse {
  current?: {
    time?: string;
    is_day?: number;
    temperature_2m?: number;
    apparent_temperature?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    wind_gusts_10m?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: (number | null)[];
    uv_index_max?: (number | null)[];
    wind_speed_10m_max?: number[];
    wind_gusts_10m_max?: number[];
  };
}

const numOr = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;

const listAt = <T,>(arr: T[] | undefined, i: number): T | undefined => arr?.[i];

function parseResponse(raw: OpenMeteoResponse): WeatherBundle {
  const days = raw.daily?.time?.length ?? 0;
  if (!raw.current || days === 0) {
    throw new Error('Unexpected weather payload');
  }
  const dayList: WeatherDay[] = [];
  for (let i = 0; i < days; i++) {
    const precip = listAt(raw.daily?.precipitation_probability_max, i);
    const uv = listAt(raw.daily?.uv_index_max, i);
    dayList.push({
      date: listAt(raw.daily?.time, i) ?? '',
      code: numOr(listAt(raw.daily?.weather_code, i), 0),
      tMax: numOr(listAt(raw.daily?.temperature_2m_max, i), 0),
      tMin: numOr(listAt(raw.daily?.temperature_2m_min, i), 0),
      precipProb: typeof precip === 'number' ? precip : null,
      uvMax: typeof uv === 'number' ? uv : null,
      windMax: numOr(listAt(raw.daily?.wind_speed_10m_max, i), 0),
      gustMax: numOr(listAt(raw.daily?.wind_gusts_10m_max, i), 0),
    });
  }
  return {
    fetchedAt: Date.now(),
    now: {
      time: raw.current.time ?? new Date().toISOString(),
      code: numOr(raw.current.weather_code, 0),
      isDay: (raw.current.is_day ?? 1) === 1,
      temperature: numOr(raw.current.temperature_2m, 0),
      apparent: numOr(raw.current.apparent_temperature, 0),
      windSpeed: numOr(raw.current.wind_speed_10m, 0),
      windGust: numOr(raw.current.wind_gusts_10m, 0),
    },
    days: dayList,
  };
}

function buildUrl(): string {
  const qs = new URLSearchParams({
    latitude: String(WEATHER_CONFIG.latitude),
    longitude: String(WEATHER_CONFIG.longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'is_day',
      'weather_code',
      'wind_speed_10m',
      'wind_gusts_10m',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'uv_index_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
    ].join(','),
    timezone: WEATHER_CONFIG.timezone,
    forecast_days: '7',
    wind_speed_unit: 'kmh',
  });
  return `${BASE}?${qs.toString()}`;
}

const CACHE_PREFIX = 'erasmusbrug.weather.v1.';

function dayKey(offsetHour: number): string {
  const d = new Date(Date.now() + offsetHour * 3600_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function readCache(): WeatherBundle | null {
  try {
    const key = CACHE_PREFIX + dayKey(0);
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { fetchedAt?: number; data?: WeatherBundle };
    if (!parsed.data || !parsed.fetchedAt) return null;
    const freshMs = (Date.now() - parsed.fetchedAt) / 1000 / 60;
    if (freshMs > WEATHER_CONFIG.cacheMinutes) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: WeatherBundle) {
  try {
    const key = CACHE_PREFIX + dayKey(0);
    window.localStorage.setItem(key, JSON.stringify({ fetchedAt: data.fetchedAt, data }));
  } catch {
    /* 隐私模式等场景忽略 */
  }
}

/**
 * 拉取实时 + 7 日预报。
 * 先读本地缓存（PWA/弱网可用），失败回退缓存，均失败时抛出异常。
 */
export async function fetchWeatherBundle(): Promise<WeatherBundle> {
  const cached = readCache();
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(buildUrl(), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = (await res.json()) as OpenMeteoResponse;
    const data = parseResponse(raw);
    writeCache(data);
    return data;
  } catch (err) {
    if (cached) return cached;
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}

/** 只读缓存（不重新请求） */
export function readCachedWeather(): WeatherBundle | null {
  return readCache();
}
