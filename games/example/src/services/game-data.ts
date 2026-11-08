import type { GameDataLoaderContext, GameDataLoadResult } from '@rranker/sdk/data-load';
import { emptyGamePayload } from '@rranker/sdk/data';
import type { ExampleDataSource } from '../data-source';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';

export async function loadData(context: GameDataLoaderContext): Promise<GameDataLoadResult> {
  const client = context.client as ExampleDataSource | undefined;
  return { bundle: { gameId: 'example', providerId: context.activeProviderId, profile: getGameProfile('example'),
    payload: client?.loadPayload() ?? emptyGamePayload('example', '未绑定账号') } };
}
