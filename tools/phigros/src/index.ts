/* eslint-disable @typescript-eslint/no-require-imports */
import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  kind: 'tool',
  cache: gameId => require('./storage').cache(gameId), id: 'tool.phigros', title: "Phigros 工具",
  gameIds: ["phigros"],
  tools: [
  {
    "id": "push-rks",
    "gameId": "phigros",
    "pageId": "push-rks",
    "title": "推分计算",
    "detail": "按期望加值与成本歌数均摊，反推每谱面目标 Acc",
    "summaryLabel": "推分计算",
    "order": 0
  },
  {
    "id": "strength-analysis",
    "gameId": "phigros",
    "pageId": "strength-analysis",
    "title": "实力分析",
    "detail": "用五维雷达查看标签强弱，并列出薄弱项练习",
    "summaryLabel": "实力分析",
    "order": 1
  },
  {
    "id": "random-charts",
    "gameId": "phigros",
    "pageId": "random-charts",
    "title": "随机歌曲",
    "detail": "按难度、定数与游玩状态随机抽取谱面",
    "summaryLabel": "随机歌曲",
    "order": 2
  },
  {
    "id": "best-image",
    "gameId": "phigros",
    "pageId": "best-image",
    "title": "生成成绩图片",
    "detail": "生成并导出 Best30 或自定义成绩图片",
    "summaryLabel": "成绩图片",
    "order": 4
  }
],
  pages,
} satisfies ToolPlugin;
