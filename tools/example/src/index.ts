import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  kind: 'tool', id: 'tool.example', title: "示例游戏工具",
  tools: [
  {
    "id": "strength-analysis",
    "gameId": "example",
    "pageId": "strength-analysis",
    "title": "实力分析",
    "detail": "查看五维能力、支撑成绩与耐力练习",
    "summaryLabel": "实力分析",
    "order": 0
  },
  {
    "id": "random-charts",
    "gameId": "example",
    "pageId": "random-charts",
    "title": "随机歌曲",
    "detail": "随机抽取 1–4 首示例歌曲",
    "summaryLabel": "随机歌曲",
    "order": 1
  }
],
  pages,
} satisfies ToolPlugin;
