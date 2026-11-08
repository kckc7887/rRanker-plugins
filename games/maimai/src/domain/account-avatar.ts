export const LXNS_COLLECTION_ASSET_ROOT = 'https://assets2.lxns.net/maimai';

export function buildLxnsIconUrl(iconId: number | null | undefined): string | null {
  if (!Number.isSafeInteger(iconId) || (iconId ?? -1) < 0) return null;
  return `${LXNS_COLLECTION_ASSET_ROOT}/icon/${iconId}.png`;
}
