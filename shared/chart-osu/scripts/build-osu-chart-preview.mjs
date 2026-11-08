import { fileURLToPath } from 'node:url';
import { buildPreview } from '@rranker/sdk/scripts/build-preview.mjs';
import { osuPreviewLicenseBanner } from './osu-preview-build.mjs';

await buildPreview(fileURLToPath(new URL('../src/features/osu-chart-preview/webview-player/', import.meta.url)), fileURLToPath(new URL('../src/assets/osu-chart-preview/', import.meta.url)), '<!--OSU_CHART_PREVIEW_CONFIG-->',
  '<script src="./audio-data.js"></script>\n  <script src="./player.js"></script>', {
    licenseBanner: osuPreviewLicenseBanner(),
  });
