import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-rizline';
import { exampleAccountIcon } from '@rranker/plugin-assets';

export const provider = { kind: 'provider', id: 'provider.rizline-test', providerId: 'rizline-test', gameIds: gameIds0,
bindingKind: 'fixture',
title: '示例查分器',
detail: '示例账号',
icon: exampleAccountIcon
} satisfies DataSourcePlugin;
