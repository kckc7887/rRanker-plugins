/* eslint-disable @typescript-eslint/no-require-imports */
import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  overviewActions: props => { const { OverviewActions } = require('./overview-actions') as typeof import('./overview-actions'); return createElement(OverviewActions, props); },
  kind: 'tool',
  cache: gameId => require('./storage').cache(gameId), id: 'tool.chunithm', title: "中二工具",
  gameIds: ["chunithm"],
  tools: [
  {
    "id": "chunithm-rating",
    "gameId": "chunithm",
    "pageId": "chunithm-rating",
    "title": "Rating / OVER POWER 计算器",
    "detail": "按定数与分数计算单谱面 Rating 与 OVER POWER，并反推最低分数",
    "summaryLabel": "Rating 计算器",
    "order": 0
  },
  {
    "id": "chunithm-collections",
    "gameId": "chunithm",
    "pageId": "chunithm-collections",
    "title": "收藏品进度",
    "detail": "浏览称号、角色、名牌版与地图头像，核对达成条件与完成状态",
    "summaryLabel": "收藏品进度",
    "order": 1
  },
  {
    "id": "random-charts",
    "gameId": "chunithm",
    "pageId": "random-charts",
    "title": "随机歌曲",
    "detail": "按难度、版本、定数与成绩条件随机抽取谱面",
    "summaryLabel": "随机歌曲",
    "order": 2
  },
  {
    "id": "best-image",
    "gameId": "chunithm",
    "pageId": "best-image",
    "title": "生成成绩图片",
    "detail": "生成并导出 B50 成绩图片",
    "summaryLabel": "成绩图片",
    "order": 4
  }
],
  overviewCards: props => createElement(require('./components/ChunithmOverviewPins').OverviewCards, props),
  pages,
} satisfies ToolPlugin;
