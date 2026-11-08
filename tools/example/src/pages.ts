import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'random-charts': () => createElement(require('./screens/ExampleToolScreens').ExampleRandomChartsScreen),
  'strength-analysis': () => createElement(require('./screens/ExampleToolScreens').ExampleStrengthAnalysisScreen),
} satisfies ToolPlugin['pages'];
