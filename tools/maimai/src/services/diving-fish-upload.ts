import { fetch as expoFetch } from 'expo/fetch';
import { z } from 'zod';
import type { DivingFishUploadRecord } from '@rranker/tool-maimai/services/score-hub-sync-map';
import { ProviderError } from '@rranker/sdk/providers/errors';
import { requestProviderWrite } from '@rranker/sdk/providers/http-json';
import { DivingFishProvider } from '@rranker/provider-diving-fish/providers/diving-fish-provider';
import { uploadedRecordsAreVisible } from '@rranker/tool-maimai/services/upload-refresh-visibility';
import { assertUploadActive, withUploadAbortSignal, type ScoreHubAbortSignal } from '@rranker/tool-maimai/services/score-hub-http';
import type { UploadWriteResult } from '@rranker/tool-maimai/services/upload-maimai-types';

const BASE_URL = 'https://www.diving-fish.com/api/maimaidxprober';

export async function uploadRecordsToDivingFish(
  importToken: string,
  records: DivingFishUploadRecord[],
  signal?: ScoreHubAbortSignal,
  options: { assertEligible?: () => void } = {},
): Promise<UploadWriteResult> {
  if (!importToken.trim()) throw new ProviderError('authentication', '上传需要 Import-Token', false);
  if (!records.length) throw new ProviderError('no_data', '没有可上传的成绩', false);
  return withUploadAbortSignal(signal, async nativeSignal => {
    options.assertEligible?.();
    const result = await requestProviderWrite({
        baseUrl: BASE_URL, path: '/player/update_records', fetcher: expoFetch as unknown as typeof fetch,
        schema: z.unknown(), label: '水鱼上传', signal: nativeSignal,
        authenticated: true, timeoutMs: 120_000, totalAttempts: 1,
        init: { method: 'POST', headers: { 'Content-Type': 'application/json', 'Import-Token': importToken }, body: JSON.stringify(records) },
        error: status => new ProviderError(status >= 500 ? 'network' : 'unknown', `水鱼上传失败（${status}）`, status >= 500),
      }, response => response.text());
    if (result.status === 'success') return { status: 'success', uploaded: records.length };
    /** 写入结果未知时只查一次，不重发。 */
    try {
      await signal?.waitUntilResumed?.();
      assertUploadActive(nativeSignal);
      options.assertEligible?.();
      const actual = await new DivingFishProvider({ mode: 'import-token', value: importToken, persistable: true }).getRecords(nativeSignal);
      const comparable = uploadedRecordsAreVisible(actual, records, 'exact');
      if (comparable) return { status: 'success', uploaded: records.length };
    } catch { assertUploadActive(nativeSignal); }
    return { status: 'unconfirmed', uploaded: 0 };
  });
}
