import type { ExampleGameDataPayload } from './domain/game-data';

export type ExampleDataSource = { loadPayload: () => ExampleGameDataPayload };
