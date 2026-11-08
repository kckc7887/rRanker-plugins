import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'push-rks': () => createElement(require('./pages/push-rks').default),
  'random-charts': () => createElement(require('./screens/PhigrosRandomChartsScreen').PhigrosRandomChartsScreen),
  'strength-analysis': () => createElement(require('./screens/PhigrosStrengthAnalysisScreen').default),
  'best-image': () => createElement(require('./screens/PhigrosBestImageScreen').PhigrosBestImageScreen),
} satisfies ToolPlugin['pages'];
