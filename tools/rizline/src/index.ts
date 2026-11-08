/* eslint-disable @typescript-eslint/no-require-imports */
import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  kind: 'tool',
  cache: gameId => require('./storage').cache(gameId), id: 'tool.rizline', title: "Rizline 工具",
  gameIds: ["rizline"],
  tools: [
  {
    "id": "best-image",
    "gameId": "rizline",
    "pageId": "best-image",
    "title": "生成成绩图片",
    "detail": "生成并导出 Best40 或自定义成绩图片",
    "summaryLabel": "成绩图片",
    "order": 0
  },
  {
    "id": "random-charts",
    "gameId": "rizline",
    "pageId": "random-charts",
    "title": "随机歌曲",
    "detail": "按难度、曲包和定数抽取谱面",
    "summaryLabel": "随机歌曲",
    "order": 1
  }
],
  pages,
} satisfies ToolPlugin;
