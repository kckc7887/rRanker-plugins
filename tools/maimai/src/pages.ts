/* eslint-disable @typescript-eslint/no-require-imports */
import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'rating': () => createElement(require('./pages/rating').default),
  'plates': () => createElement(require('./pages/plates').default),
  'versions': () => createElement(require('./pages/versions').default),
  'kaleidx-scope': () => createElement(require('./pages/kaleidx-scope').default),
  'random-charts': () => createElement(require('./screens/MaimaiRandomChartsScreen').MaimaiRandomChartsScreen),
  'strength-analysis': () => createElement(require('./screens/MaimaiStrengthAnalysisScreen').MaimaiStrengthAnalysisScreen),
  'best-image': () => createElement(require('./screens/maimai/MaimaiBestImageScreen').MaimaiBestImageScreen),
} satisfies ToolPlugin['pages'];
