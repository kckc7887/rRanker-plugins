import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-phigros';
import taptapIcon from './assets/taptap.webp';

export const provider = { kind: 'provider', id: 'provider.phi-taptap', providerId: 'phi-taptap', gameIds: gameIds0,
bindingKind: 'device-code',
title: 'TapTap 云存档',
detail: '扫码或前往 TapTap 授权',
icon: taptapIcon
} satisfies DataSourcePlugin;
