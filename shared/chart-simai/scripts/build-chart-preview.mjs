import { fileURLToPath } from 'node:url';
import { buildPreview } from '@rranker/sdk/scripts/build-preview.mjs';

await buildPreview(fileURLToPath(new URL('../src/features/simai-chart-preview/webview-player/', import.meta.url)), fileURLToPath(new URL('../src/assets/maimai-chart-preview/', import.meta.url)), '<!--CHART_PREVIEW_CONFIG-->',
  '<script src="./music-data.js"></script>\n  <script src="./skin-data.js"></script>\n  <script src="./player.js"></script>');
