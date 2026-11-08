import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'random-charts': () => createElement(require('./screens/RizlineRandomChartsScreen').RizlineRandomChartsScreen),
  'best-image': () => createElement(require('./screens/RizlineBestImageScreen').RizlineBestImageScreen),
} satisfies ToolPlugin['pages'];
