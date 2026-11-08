import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  kind: 'tool', id: 'tool.simai', title: "达成率与容错",
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
  pages,
} satisfies ToolPlugin;
