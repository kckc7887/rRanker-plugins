import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-adofai';
import tufIcon from './assets/tuf.webp';

export const provider = { kind: 'provider', id: 'provider.tuf', providerId: 'tuf', gameIds: gameIds0,
bindingKind: 'public-player',
title: 'TUF 社区',
detail: '搜索公开玩家 · 无需登录',
icon: tufIcon
} satisfies DataSourcePlugin;
