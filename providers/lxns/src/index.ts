import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-maimai';
import { gameIds as gameIds1 } from '@rranker/game-chunithm';
import lxnsIcon from './assets/lxns.webp';

export const provider = { kind: 'provider', id: 'provider.lxns', providerId: 'lxns', gameIds: [...gameIds0, ...gameIds1],
bindingKind: 'oauth-code',
title: '落雪查分器',
detail: 'OAuth 授权（授权后自动返回）',
icon: lxnsIcon
} satisfies DataSourcePlugin;
