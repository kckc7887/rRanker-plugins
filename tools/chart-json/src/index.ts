/* eslint-disable @typescript-eslint/no-require-imports */
import type { ToolPlugin } from '@rranker/sdk';
import { createElement } from 'react';
import { pages } from './pages';

export const tool = {
  requiredCapabilities: {"phigros":["chart.phigros"],"phira":["chart.phigros"],"rizline":["chart.rizline"]},
  kind: 'tool', id: 'tool.chart-json', title: '谱面确认', gameIds: ['phigros', 'phira', 'rizline'], tools: [], pages,
  detailActions: props => createElement((require('./DetailActions') as typeof import('./DetailActions')).DetailActions, props),
  chartDownloads: {
    phigros: (params, options) => require('./chart-download').downloadPhigros(params, options),
    phira: (params, options) => require('./chart-download').downloadPhira(params, options),
  },
} satisfies ToolPlugin;
