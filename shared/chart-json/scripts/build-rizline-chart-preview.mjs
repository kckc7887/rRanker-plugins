import { fileURLToPath } from 'node:url';
import { buildPreview } from '@rranker/sdk/scripts/build-preview.mjs';

await buildPreview(fileURLToPath(new URL('../src/features/rizline-chart-preview/webview-player/', import.meta.url)), fileURLToPath(new URL('../src/assets/rizline-chart-preview/', import.meta.url)), '<!--RIZLINE_CHART_PREVIEW_CONFIG-->',
  '<script src="./player.js"></script>');
