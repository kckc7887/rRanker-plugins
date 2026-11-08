import type { DataSourcePlugin } from '@rranker/sdk';
import { adapter, gameIds as gameIds0 } from '@rranker/game-rizline';
const rizlineIcon = adapter.games[0].icon;

export const provider = { kind: 'provider', id: 'provider.rizline-official', providerId: 'rizline-official', gameIds: gameIds0,
title: '官方账号',
detail: '手机号验证码或账密登录',
icon: rizlineIcon,
bindingKind: 'sms-code'
} satisfies DataSourcePlugin;
