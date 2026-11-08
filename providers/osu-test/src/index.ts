import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-osu';
import { exampleAccountIcon } from '@rranker/plugin-assets';

export const provider = { kind: 'provider', id: 'provider.osu-test', providerId: 'osu-test', gameIds: gameIds0,
bindingKind: 'fixture',
title: '示例查分器',
detail: '示例账号',
icon: exampleAccountIcon
} satisfies DataSourcePlugin;
