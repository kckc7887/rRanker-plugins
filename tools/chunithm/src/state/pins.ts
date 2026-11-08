import { z } from 'zod';
import { createPinsStore, type PinsByGame } from '@rranker/sdk/state/pins';
import { createPreferencesStore } from '@rranker/sdk/storage/create-preferences-store';

const collection = z.object({ kind: z.enum(['trophy', 'character', 'plate', 'icon']), id: z.number().int().nonnegative() });
export type PinnedCollection = z.infer<typeof collection>;
const sameCollection = (a: PinnedCollection, b: PinnedCollection) => a.kind === b.kind && a.id === b.id;
const schema = z.object({
  version: z.literal(1),
  pinsByGame: z.record(z.string(), z.array(collection).transform(items =>
    items.filter((item, index) => items.findIndex(other => sameCollection(item, other)) === index))),
});
const { Store: CollectionPinPreferencesStore } = createPreferencesStore<PinsByGame<PinnedCollection>>({
  storeKey: 'rranker.chunithm.pins',
  defaults: () => ({}),
  parse: value => schema.parse(value).pinsByGame,
  toStored: pinsByGame => ({ version: 1, pinsByGame }),
});
export { CollectionPinPreferencesStore };
export const useCollectionPins = createPinsStore(new CollectionPinPreferencesStore(), sameCollection);
