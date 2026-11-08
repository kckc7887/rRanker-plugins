/* eslint-disable @typescript-eslint/no-require-imports */
import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'chunithm-rating': () => createElement(require('./pages/chunithm-rating').default),
  'chunithm-collections': () => createElement(require('./pages/chunithm-collections').default),
  'random-charts': () => createElement(require('./screens/ChunithmRandomChartsScreen').ChunithmRandomChartsScreen),
  'best-image': () => createElement(require('./screens/ChunithmBestImageScreen').ChunithmBestImageScreen),
} satisfies ToolPlugin['pages'];
