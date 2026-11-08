import type { ToolPlugin } from '@rranker/sdk';
import { pages } from './pages';

export const tool = {
  kind: 'tool', id: 'tool.maimai', title: "舞萌工具",
  tools: [
  {
    "id": "strength-analysis",
    "gameId": "maimai",
    "pageId": "strength-analysis",
    "title": "实力分析",
    "detail": "查看五维能力、支撑成绩与薄弱项练习",
    "summaryLabel": "实力分析",
    "order": 0
  },
  {
    "id": "rating",
    "gameId": "maimai",
    "pageId": "rating",
    "title": "DX Rating 计算器",
    "detail": "档位表、指定达成率与目标 Rating 反推",
    "summaryLabel": "Rating",
    "order": 1
  },
  {
    "id": "plates",
    "gameId": "maimai",
    "pageId": "plates",
    "title": "牌子进度",
    "detail": "用最佳成绩核对版本姓名框要求",
    "summaryLabel": "牌子进度",
    "order": 3
  },
  {
    "id": "versions",
    "gameId": "maimai",
    "pageId": "versions",
    "title": "版本对照与总结",
    "detail": "国服/日服名称对照，以及逐版本游玩情况",
    "summaryLabel": "版本对照",
    "order": 4
  },
  {
    "id": "kaleidx-scope",
    "gameId": "maimai",
    "pageId": "kaleidx-scope",
    "title": "KALEIDX◈SCOPE",
    "detail": "查询国服门曲条件、进度等信息",
    "summaryLabel": "万花筒",
    "order": 5
  },
  {
    "id": "random-charts",
    "gameId": "maimai",
    "pageId": "random-charts",
    "title": "随机歌曲",
    "detail": "按难度、定数与游玩状态随机抽取谱面",
    "summaryLabel": "随机歌曲",
    "order": 6
  },
  {
    "id": "best-image",
    "gameId": "maimai",
    "pageId": "best-image",
    "title": "生成成绩图片",
    "detail": "生成并导出 B50 或自定义成绩图片",
    "summaryLabel": "成绩图片",
    "order": 8
  }
],
  pages,
} satisfies ToolPlugin;
