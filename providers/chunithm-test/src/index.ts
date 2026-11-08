import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-chunithm';
import { exampleAccountIcon } from '@rranker/plugin-assets';

export const provider = { kind: 'provider', id: 'provider.chunithm-test', providerId: 'chunithm-test', gameIds: gameIds0,
bindingKind: 'fixture',
title: '示例查分器',
detail: '示例账号',
icon: exampleAccountIcon
} satisfies DataSourcePlugin;
