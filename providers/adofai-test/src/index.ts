import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-adofai';
import { exampleAccountIcon } from '@rranker/plugin-assets';

export const provider = { kind: 'provider', id: 'provider.adofai-test', providerId: 'adofai-test', gameIds: gameIds0,
bindingKind: 'fixture',
title: '示例查分器',
detail: '示例账号',
icon: exampleAccountIcon
} satisfies DataSourcePlugin;
