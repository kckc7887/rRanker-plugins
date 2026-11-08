import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  kind: 'tool', id: 'tool.osu', title: "osu! 模组百科",
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
  pages,
} satisfies ToolPlugin;
