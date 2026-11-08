import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  kind: 'tool', id: 'tool.phira', title: "Phira 工具",
  tools: [
  {
    "id": "random-charts",
    "gameId": "phira",
    "pageId": "random-charts",
    "title": "随机歌曲",
    "detail": "从成绩页已缓存的最佳成绩中随机抽取谱面",
    "summaryLabel": "随机歌曲",
    "order": 0
  }
],
  pages,
} satisfies ToolPlugin;
