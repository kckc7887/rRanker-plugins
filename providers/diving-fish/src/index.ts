import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-maimai';
import divingFishIcon from './assets/diving-fish.webp';

export const provider = { kind: 'provider', id: 'provider.diving-fish', providerId: 'diving-fish', gameIds: gameIds0,
bindingKind: 'credentials',
title: '水鱼查分器',
detail: '账密登录（可上传）',
icon: divingFishIcon
} satisfies DataSourcePlugin;
