import { fileURLToPath } from 'node:url';
import { buildPreview } from '@rranker/sdk/scripts/build-preview.mjs';

for (const rpe of [false, true]) {
  await buildPreview(fileURLToPath(new URL('../src/features/phigros-chart-preview/webview-player/', import.meta.url)), fileURLToPath(new URL('../src/assets/phigros-chart-preview/', import.meta.url)), '<!--PHIGROS_CHART_PREVIEW_CONFIG-->',
    '<script src="./player.js"></script>', {
      scriptFile: rpe ? 'rpe.bundle' : 'player.bundle', define: { RPE_PLAYER: String(rpe) },
    });
}
