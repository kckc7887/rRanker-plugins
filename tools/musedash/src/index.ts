import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  kind: 'tool', id: 'tool.musedash', title: "喵斯快跑工具",
  gameIds: ["musedash"],
  tools: [
  {
    "id": "random-charts",
    "gameId": "musedash",
    "pageId": "random-charts",
    "title": "随机歌曲",
    "detail": "按难度、DLC、定数与成绩条件随机抽取谱面",
    "summaryLabel": "随机歌曲",
    "order": 0
  }
],
  pages,
} satisfies ToolPlugin;
