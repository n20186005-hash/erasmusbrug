import {
  beaufort,
  classify,
  isFogCode,
  isHeavyRainCode,
  isRainyKind,
  isThunderCode,
  type WeatherDay,
  type WeatherNow,
} from './weather';

/* ============================================================
 * 智能建议引擎（与语言无关）
 * 依据天气码 + 数值阈值，输出「出行穿搭/游玩安排/随身物品/风险」
 * 四类建议的消息 key。UI 层通过 next-intl 按 key 取对应语言文案。
 * ============================================================ */

export type AdviceCat = 'outfit' | 'play' | 'gear';

export interface AdviceResult {
  outfit: string[]; // tip rule keys
  play: string[];
  gear: string[];
  risks: string[]; // risk rule keys（置顶红色提醒）
}

const EMPTY: AdviceResult = { outfit: [], play: [], gear: [], risks: [] };

/** 简化的蒲福级判定：数值转档位 */
export function windLevelName(bft: number): string {
  if (bft <= 3) return 'calm';
  if (bft === 4) return 'moderate';
  if (bft <= 6) return 'strong';
  if (bft <= 9) return 'gale';
  return 'storm';
}

export function buildAdvice(today: WeatherDay, now: WeatherNow): AdviceResult {
  const res: AdviceResult = {
    outfit: [],
    play: [],
    gear: [],
    risks: [],
  };

  const kind = classify(today.code);
  const raining = isRainyKind(kind);
  const bftNow = beaufort(now.windSpeed);
  const bftDay = beaufort(today.windMax);
  const bft = Math.max(bftNow, bftDay);
  const uv = today.uvMax ?? 0;
  const prob = today.precipProb ?? 0;
  const diff = today.tMax - today.tMin;

  const push = (cat: AdviceCat, key: string) => {
    if (!res[cat].includes(key)) res[cat].push(key);
  };
  const risk = (key: string) => {
    if (!res.risks.includes(key)) res.risks.push(key);
  };

  // ---- 雷雨（最高优先级风险）----
  if (isThunderCode(today.code)) {
    risk('rThunder');
    push('play', 'thunder');
  } else if (isHeavyRainCode(today.code)) {
    // 大雨 / 强阵雨
    risk('rHeavyRain');
    push('outfit', 'heavyRain');
    push('play', 'heavyRain');
    push('gear', 'heavyRain');
  } else if (kind === 'rain') {
    // 中雨
    push('outfit', 'rain');
    push('play', 'rain');
    push('gear', 'rain');
  } else if (kind === 'lightRain' || kind === 'drizzle') {
    push('outfit', 'lightRain');
    push('play', 'lightRain');
    push('gear', 'lightRain');
  } else if (kind === 'snow' || kind === 'snowShower' || kind === 'sleet') {
    push('outfit', 'snow');
    push('play', 'snow');
    push('gear', 'snow');
  } else if (!raining && prob >= 60) {
    // 降水概率高但当前分类无雨 → “大概率下雨”型提示
    push('outfit', 'rainLikely');
    push('play', 'rainLikely');
    push('gear', 'rainLikely');
  }

  // ---- 大雾 ----
  if (isFogCode(today.code)) {
    risk('rFog');
    push('play', 'fog');
    push('gear', 'fog');
  }

  // ---- 温度 ----
  if (today.tMax >= 32) {
    push('outfit', 'heat');
    push('play', 'heat');
    push('gear', 'heat');
  } else if (today.tMax <= 10) {
    push('outfit', 'cold');
    push('gear', 'cold');
  }
  if (diff > 8) {
    push('outfit', 'swing');
  }

  // ---- 紫外线 ----
  if (uv >= 5) {
    push('outfit', 'uvHigh');
    push('gear', 'uvHigh');
  }

  // ---- 风力 ----
  if (bft >= 7) {
    risk('rWind');
    push('play', 'windGale');
  } else if (bft >= 5) {
    push('outfit', 'windStrong');
    push('play', 'windStrong');
    push('gear', 'windStrong');
  }

  // ---- 晴天 / 阴天基调（仅非降水时给户外安排建议）----
  if (!raining && (kind === 'clear' || kind === 'partly')) {
    push('play', 'sunny');
    push('gear', 'sunny');
  } else if (!raining && (kind === 'cloudy' || kind === 'overcast')) {
    push('outfit', 'overcast');
    push('play', 'overcast');
  }

  // ---- 默认兜底：天气平稳且无任何穿搭提示时的温和文案 ----
  if (res.outfit.length === 0 && res.risks.length === 0 && !raining) {
    res.outfit.push('mild');
  }

  return { ...res };
}

export function emptyAdvice(): AdviceResult {
  return { ...EMPTY };
}
