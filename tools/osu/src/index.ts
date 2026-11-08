/* eslint-disable @typescript-eslint/no-require-imports */
import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  requiredCapabilities: {"osu-standard":["chart.osu"],"osu-mania":["chart.osu"],"osu-catch":["chart.osu"],"osu-taiko":["chart.osu"]},
  kind: 'tool', id: 'tool.osu', title: "osu! 模组百科",
  gameIds: ["osu-standard","osu-mania","osu-catch","osu-taiko"],
  tools: [
  {
    "id": "osu-mods",
    "gameId": "osu-standard",
    "pageId": "osu-mods",
    "title": "模组百科",
    "detail": "查看当前模式可用模组、玩法说明与难度影响",
    "summaryLabel": "模组百科",
    "order": 1
  },
  {
    "id": "osu-mods",
    "gameId": "osu-mania",
    "pageId": "osu-mods",
    "title": "模组百科",
    "detail": "查看当前模式可用模组、玩法说明与难度影响",
    "summaryLabel": "模组百科",
    "order": 1
  },
  {
    "id": "osu-mods",
    "gameId": "osu-catch",
    "pageId": "osu-mods",
    "title": "模组百科",
    "detail": "查看当前模式可用模组、玩法说明与难度影响",
    "summaryLabel": "模组百科",
    "order": 1
  },
  {
    "id": "osu-mods",
    "gameId": "osu-taiko",
    "pageId": "osu-mods",
    "title": "模组百科",
    "detail": "查看当前模式可用模组、玩法说明与难度影响",
    "summaryLabel": "模组百科",
    "order": 1
  }
],
  chartDownloads: {
    'osu-standard': (params, options) => require('./chart-download').downloadOsu(params, options),
    'osu-mania': (params, options) => require('./chart-download').downloadOsu(params, options),
    'osu-catch': (params, options) => require('./chart-download').downloadOsu(params, options),
    'osu-taiko': (params, options) => require('./chart-download').downloadOsu(params, options),
  },
  pages,
} satisfies ToolPlugin;
