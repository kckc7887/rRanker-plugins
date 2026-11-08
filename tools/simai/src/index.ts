/* eslint-disable @typescript-eslint/no-require-imports */
import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  requiredCapabilities: {"maimai":["chart.simai"],"majdata-net":["chart.simai"]},
  kind: 'tool', id: 'tool.simai', title: "达成率与容错",
  gameIds: ["majdata-net","maimai"],
  tools: [
  {
    "id": "tolerance",
    "gameId": "majdata-net",
    "pageId": "tolerance",
    "title": "达成率与容错",
    "detail": "计算 DX、Classic 达成率与容错",
    "summaryLabel": "达成率/容错",
    "order": 1
  },
  {
    "id": "tolerance",
    "gameId": "maimai",
    "pageId": "tolerance",
    "title": "达成率与容错",
    "detail": "Note 权重、BREAK 奖励与同类错误上限",
    "summaryLabel": "达成率/容错",
    "order": 2
  }
],
  chartDownloads: {
    'maimai': (params, options) => require('./chart-download').downloadMaimai(params, options),
    'majdata-net': (params, options) => require('./chart-download').downloadMajdata(params, options),
  },
  pages,
} satisfies ToolPlugin;
