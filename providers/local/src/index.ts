import type { DataSourcePlugin } from '@rranker/sdk';
import { adapter, gameIds as gameIds0 } from '@rranker/game-maimai';
const maimaiIcon = adapter.games[0].icon;

export const provider = { kind: 'provider', id: 'provider.local', providerId: 'local', gameIds: gameIds0,
bindingKind: 'local',
title: '本地查分器',
detail: '可添加多个玩家',
icon: maimaiIcon
} satisfies DataSourcePlugin;
