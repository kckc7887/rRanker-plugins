import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  kind: 'tool', id: 'tool.arcade-finder', title: "音游地图",
  gameIds: ["example","rizline","majdata-net","maimai","phigros","phira","chunithm","adofai","musedash","osu-standard","osu-mania","osu-catch","osu-taiko"],
  tools: [
  {
    "id": "arcade-finder",
    "gameId": "example",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "查找附近机厅",
    "summaryLabel": "音游地图",
    "order": 2
  },
  {
    "id": "arcade-finder",
    "gameId": "rizline",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "按定位查看附近机厅，搜索店名与跳转导航",
    "summaryLabel": "音游地图",
    "order": 2
  },
  {
    "id": "arcade-finder",
    "gameId": "majdata-net",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "查找附近机厅",
    "summaryLabel": "音游地图",
    "order": 0
  },
  {
    "id": "arcade-finder",
    "gameId": "maimai",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "按定位查看附近机厅，搜索店名与跳转导航",
    "summaryLabel": "音游地图",
    "order": 7
  },
  {
    "id": "arcade-finder",
    "gameId": "phigros",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "按定位查看附近机厅，搜索店名与跳转导航",
    "summaryLabel": "音游地图",
    "order": 3
  },
  {
    "id": "arcade-finder",
    "gameId": "phira",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "按定位查看附近机厅，搜索店名与跳转导航",
    "summaryLabel": "音游地图",
    "order": 1
  },
  {
    "id": "arcade-finder",
    "gameId": "chunithm",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "按定位查看附近机厅，搜索店名与跳转导航",
    "summaryLabel": "音游地图",
    "order": 3
  },
  {
    "id": "arcade-finder",
    "gameId": "adofai",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "按定位查看附近机厅，搜索店名与跳转导航",
    "summaryLabel": "音游地图",
    "order": 1
  },
  {
    "id": "arcade-finder",
    "gameId": "musedash",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "按定位查看附近机厅，搜索店名与跳转导航",
    "summaryLabel": "音游地图",
    "order": 1
  },
  {
    "id": "arcade-finder",
    "gameId": "osu-standard",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "按定位查看附近机厅，搜索店名与跳转导航",
    "summaryLabel": "音游地图",
    "order": 0
  },
  {
    "id": "arcade-finder",
    "gameId": "osu-mania",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "按定位查看附近机厅，搜索店名与跳转导航",
    "summaryLabel": "音游地图",
    "order": 0
  },
  {
    "id": "arcade-finder",
    "gameId": "osu-catch",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "按定位查看附近机厅，搜索店名与跳转导航",
    "summaryLabel": "音游地图",
    "order": 0
  },
  {
    "id": "arcade-finder",
    "gameId": "osu-taiko",
    "pageId": "arcade-finder",
    "title": "音游地图",
    "detail": "按定位查看附近机厅，搜索店名与跳转导航",
    "summaryLabel": "音游地图",
    "order": 0
  }
],
  pages,
} satisfies ToolPlugin;
