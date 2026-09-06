/**
 * 天气模块站点级配置（Erasmusbrug / Rotterdam）
 * 换景点时只需替换坐标与场景特征即可复用整套天气智能建议。
 */
export const WEATHER_CONFIG = {
  // 目标城市坐标（Open-Meteo 免 Key 查询）
  latitude: 51.909004,
  longitude: 4.4871227,
  timezone: 'Europe/Amsterdam',
  // 展示用城市名
  city: 'Rotterdam',
  // 当地天气缓存过期时间（分钟）
  cacheMinutes: 45,
  // 场景特征：决定是否叠加「水岸/游船/开阔桥面」类建议文案
  // openWater：河湖海边；mountain：山地峡谷；forest：森林草原；cityOnly：仅城市
  terrain: 'openWater' as 'openWater' | 'mountain' | 'forest' | 'cityOnly',
} as const;
