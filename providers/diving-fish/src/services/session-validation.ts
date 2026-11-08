import type { Credential } from '@rranker/sdk/credentials';
import type { ScoreProvider } from '@rranker/game-maimai/data-source';
import type { Player } from '@rranker/game-maimai/domain/models';

export async function validateScoreProvider(provider: ScoreProvider, signal?: AbortSignal): Promise<Player> {
  if (signal?.aborted) throw signal.reason;
  const [player] = await Promise.all([provider.getPlayer(signal), provider.getRecords(signal)]);
  if (signal?.aborted) throw signal.reason;
  return player;
}

interface SessionActivationDependencies {
  createProvider: (session: Credential) => ScoreProvider;
  save: (session: Credential, player: Player) => Promise<void>;
  activate: (session: Credential, player: Player) => void;
  signal?: AbortSignal;
  assertCurrent?: () => void;
}

export async function validateAndActivateSession(
  session: Credential,
  dependencies: SessionActivationDependencies,
): Promise<Player> {
  const assertCurrent = () => {
    if (dependencies.signal?.aborted) throw dependencies.signal.reason;
    dependencies.assertCurrent?.();
  };
  assertCurrent();
  const provider = dependencies.createProvider(session);
  const player = await validateScoreProvider(provider, dependencies.signal);
  assertCurrent();
  await dependencies.save(session, player);
  assertCurrent();
  dependencies.activate(session, player);
  return player;
}
