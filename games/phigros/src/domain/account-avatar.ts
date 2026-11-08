export const PHIGROS_OSS_BASE = 'https://rranker-phigros-data.cn-nb1.rains3.com';

export function isPhigrosAvatarUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.origin === PHIGROS_OSS_BASE && /^\/phigros\/avatars\/[a-f\d]{64}\.png$/.test(url.pathname);
  } catch { return false; }
}
