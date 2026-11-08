import { parseCredential } from '@rranker/provider-lxns/credential';
import type { Credential } from '@rranker/sdk/credentials';
import { fetch as expoFetch } from 'expo/fetch';
import { z } from 'zod';

import { ProviderError } from '@rranker/sdk/providers/errors';
import { requestProviderWrite } from '@rranker/sdk/providers/http-json';
import { lxnsAccessTokenExpired, rotateLxnsTokens, type LxnsOAuthSession } from '@rranker/provider-lxns/providers/lxns-oauth';
import type { LxnsTokenRotationUpdate } from '@rranker/provider-lxns/providers/lxns-oauth-request';
import { LXNS_API_ROOT } from '@rranker/provider-lxns/providers/lxns-config';
import type { LxnsUploadScore } from '@rranker/tool-maimai/services/score-hub-sync-map';
import { assertUploadActive, withUploadAbortSignal, type ScoreHubAbortSignal } from '@rranker/tool-maimai/services/score-hub-http';
import type { UploadWriteResult } from '@rranker/tool-maimai/services/upload-maimai-types';

export async function uploadRecordsToLxns(input: {
  session: Credential;
  records: LxnsUploadScore[];
  courseRank?: number;
  signal?: ScoreHubAbortSignal;
  assertEligible?: () => void;
  onTokensRotated?: (update: LxnsTokenRotationUpdate) => void | Promise<unknown>;
}): Promise<UploadWriteResult & { session: LxnsOAuthSession }> {
  const parsed = parseCredential(input.session);
  if (!parsed) throw new ProviderError('authentication', '落雪上传需要 OAuth 授权', false);
  if (!input.records.length) throw new ProviderError('no_data', '没有可上传到落雪的成绩', false);
  let session = parsed;
  return withUploadAbortSignal(input.signal, async signal => {
    input.assertEligible?.();
    if (lxnsAccessTokenExpired(session)) {
      const previous = session;
      session = await rotateLxnsTokens(previous.refreshToken);
      await input.onTokensRotated?.({ previous, next: session });
    }
    const writes = [
      ...(input.courseRank === undefined ? [] : [{
        path: '/user/maimai/player', method: 'PUT', body: { course_rank: input.courseRank },
      }]),
      { path: '/user/maimai/player/scores', method: 'POST', body: { scores: input.records } },
    ];
    for (const write of writes) {
      await input.signal?.waitUntilResumed?.();
      assertUploadActive(signal);
      input.assertEligible?.();
      const result = await requestProviderWrite({
        baseUrl: LXNS_API_ROOT, path: write.path, fetcher: expoFetch as unknown as typeof fetch,
        schema: z.unknown(), label: '落雪上传', signal, authenticated: true, timeoutMs: 120_000, totalAttempts: 1,
        init: { method: write.method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` }, body: JSON.stringify(write.body) },
        error: status => status === 401 ? new ProviderError('authentication', '落雪 OAuth 已失效，请重新授权', false)
          : status === 403 ? new ProviderError('permission', '落雪授权未包含 write_player 权限', false)
          : status === 429 ? new ProviderError('rate_limit', '落雪请求过于频繁，请稍后重试', false)
          : new ProviderError(status >= 500 ? 'network' : 'unknown', `落雪上传失败（${status}）`, status >= 500),
      }, response => response.text());
      if (result.status === 'unconfirmed') return { status: 'unconfirmed', uploaded: 0, session };
    }
    return { status: 'success', uploaded: input.records.length, session };
  });
}
