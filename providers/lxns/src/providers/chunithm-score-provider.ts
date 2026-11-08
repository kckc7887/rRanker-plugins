import type { Credential } from '@rranker/sdk/credentials';
import { parseCredential } from '@rranker/provider-lxns/credential';
import {
  ChunithmBestsSchema,
  ChunithmPlayerSchema,
  ChunithmScoreSchema,
  emptyChunithmBests,
  type ChunithmBests,
  type ChunithmPersonalSnapshot,
  type ChunithmPlayer,
  type ChunithmScore,
} from '@rranker/game-chunithm/domain/chunithm-personal';

import { ProviderError } from '@rranker/sdk/providers/errors';
import {
  LxnsOAuthRequestCore,
  type LxnsOAuthRequestTexts,
  type LxnsTokenRotationHandler,
} from '@rranker/provider-lxns/providers/lxns-oauth-request';
import type { LxnsOAuthSession } from '@rranker/provider-lxns/providers/lxns-oauth';

type OptionalResponse = { found: boolean; data?: unknown };

const CHUNITHM_REQUEST_TEXTS: LxnsOAuthRequestTexts = {
  envelopeSchemaMessage: '落雪中二响应结构与已验证契约不一致',
  authRejectedFallback: '落雪拒绝了本次中二请求',
  timeoutMessage: '落雪中二读取超时',
};

export class ChunithmScoreProvider {
  private readonly oauth: LxnsOAuthRequestCore;

  constructor(
    session: Credential,
    onTokensRotated?: LxnsTokenRotationHandler,
  ) {
    const credential = parseCredential(session);
    if (!credential) {
      throw new ProviderError('authentication', '中二节奏落雪读取需要 OAuth 会话', false);
    }
    this.oauth = new LxnsOAuthRequestCore(credential, onTokensRotated);
  }

  getSession(): LxnsOAuthSession {
    return this.oauth.getSession();
  }

  private source() {
    return {
      kind: 'lxns' as const,
      label: '落雪咖啡屋',
      updatedAt: new Date().toISOString(),
      isStale: false,
    };
  }

  private async request(path: string, optional = false, signal?: AbortSignal): Promise<OptionalResponse> {
    const data = await this.oauth.request(path, optional, CHUNITHM_REQUEST_TEXTS, signal);
    if (!optional) return { found: true, data };
    return data === null ? { found: false } : { found: true, data };
  }

  async getPlayer(signal?: AbortSignal): Promise<ChunithmPlayer | null> {
    const result = await this.request('/user/chunithm/player', true, signal);
    if (!result.found) return null;
    const parsed = ChunithmPlayerSchema.safeParse(result.data);
    if (!parsed.success) {
      throw new ProviderError('upstream_schema', '落雪中二玩家响应结构与已验证契约不一致', true);
    }
    return parsed.data;
  }

  async getScores(signal?: AbortSignal): Promise<ChunithmScore[]> {
    const result = await this.request('/user/chunithm/player/scores', true, signal);
    if (!result.found) return [];
    if (!Array.isArray(result.data)) {
      throw new ProviderError('upstream_schema', '落雪中二成绩响应结构与已验证契约不一致', true);
    }
    return result.data.map((item) => {
      const parsed = ChunithmScoreSchema.safeParse(item);
      if (!parsed.success) {
        throw new ProviderError('upstream_schema', '落雪中二成绩条目与已验证契约不一致', true);
      }
      return parsed.data;
    });
  }

  async getBests(signal?: AbortSignal): Promise<ChunithmBests> {
    const result = await this.request('/user/chunithm/player/bests', true, signal);
    if (!result.found) return emptyChunithmBests();
    const parsed = ChunithmBestsSchema.safeParse(result.data);
    if (!parsed.success) {
      throw new ProviderError('upstream_schema', '落雪中二 B50 响应结构与已验证契约不一致', true);
    }
    return {
      bests: parsed.data.bests,
      selections: parsed.data.selections,
      new_bests: parsed.data.new_bests,
    };
  }

  async getSnapshot(signal?: AbortSignal): Promise<ChunithmPersonalSnapshot> {
    const [player, scores, bests] = await Promise.all([
      this.getPlayer(signal),
      this.getScores(signal),
      this.getBests(signal),
    ]);
    return {
      player,
      scores,
      bests,
      source: this.source(),
    };
  }
}
