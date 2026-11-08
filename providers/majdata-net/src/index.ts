import type { DataSourcePlugin } from '@rranker/sdk';
import { adapter, gameIds as gameIds0 } from '@rranker/game-majdata-net';
const majdataIcon = adapter.games[0].icon;

export const provider = { kind: 'provider', id: 'provider.majdata-net', providerId: 'majdata-net', gameIds: gameIds0,
title: 'Majdata Net',
detail: '账密登录',
icon: majdataIcon,
bindingKind: 'credentials'
} satisfies DataSourcePlugin;
