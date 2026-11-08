/* eslint-disable @typescript-eslint/no-require-imports */
import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'random-charts': () => createElement(require('./screens/MuseDashRandomChartsScreen').MuseDashRandomChartsScreen),
} satisfies ToolPlugin['pages'];
