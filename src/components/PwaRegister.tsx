'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    // 只在生产环境注册，避免开发模式下缓存干扰热更新
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {
          // 注册失败不阻塞页面
        });
    });
  }, []);

  return null;
}
