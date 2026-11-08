import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  kind: 'tool', id: 'tool.adofai', title: "冰与火之舞工具",
  gameIds: ["adofai"],
  tools: [
  {
    "id": "random-charts",
    "gameId": "adofai",
    "pageId": "random-charts",
    "title": "随机歌曲",
    "detail": "按难度、区间与达成状态随机抽取公开成绩中的关卡",
    "summaryLabel": "随机歌曲",
    "order": 0
  }
],
  pages,
} satisfies ToolPlugin;
