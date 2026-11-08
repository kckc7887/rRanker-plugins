import { z } from 'zod';
import { createPinsStore, type PinsByGame } from '@rranker/sdk/state/pins';
import { createPreferencesStore } from '@rranker/sdk/storage/create-preferences-store';

const schema = z.object({
  version: z.literal(1),
  pinsByGame: z.record(z.string(), z.array(z.number().int().positive()).transform(ids => [...new Set(ids)])),
});
const { Store: PlatePinPreferencesStore } = createPreferencesStore<PinsByGame<number>>({
  storeKey: 'rranker.maimai.pins',
  defaults: () => ({}),
  parse: value => schema.parse(value).pinsByGame,
  toStored: pinsByGame => ({ version: 1, pinsByGame }),
});
export { PlatePinPreferencesStore };
export const usePlatePins = createPinsStore(new PlatePinPreferencesStore());
