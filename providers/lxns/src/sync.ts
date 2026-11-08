import type { GameDataRefreshResult, SyncFailureNotice } from '@rranker/sdk/data-load';
export function syncFailureNotice(gameId: string, result: GameDataRefreshResult): SyncFailureNotice | undefined {
  const failure = result.failures.find(item => item.code === 'authentication')
    ?? result.failures.find(item => item.target === 'data') ?? result.failures[0];
  if (failure?.code !== 'no_data' || (gameId !== 'maimai' && gameId !== 'chunithm')) return;
  const payload = result.value?.payload;
  const stale = payload?.kind === gameId && payload.source.isStale;
  return { title: '尚未读取到新数据', variant: 'warning', message: stale
    ? '本次仅读取到缓存，请关闭代理并检查网络后重试。'
    : gameId === 'maimai' ? '请确认微信已完成上传、代理已经关闭，再重试同步。'
      : '请确认微信已提示上传完成、代理已经关闭，再重试同步。' };
}
