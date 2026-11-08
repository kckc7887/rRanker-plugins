import type { CollectionKind } from '@rranker/game-maimai/domain/models';
import { CollectionArtwork } from '@rranker/sdk/components/CollectionArtwork';
const ASSET_ROOT = 'https://assets2.lxns.net/maimai';

export function CollectionImage({
  kind,
  collectionId,
  size = 40,
  borderRadius = 8,
}: {
  kind: Exclude<CollectionKind, 'trophy'>;
  collectionId: number;
  size?: number;
  borderRadius?: number;
}) {
  return <CollectionArtwork source={`${ASSET_ROOT}/${kind}/${collectionId}.png`} label={`${kind} 预览`}
    height={size} aspect={kind === 'plate' ? 720 / 116 : 1} borderRadius={borderRadius} />;
}
