import { createElement } from 'react';
import { parseCredential, credentialMatches } from './credential';
import type { DataSourcePlugin } from '@rranker/sdk';
import { adapter, gameIds as gameIds0 } from '@rranker/game-rizline';
const rizlineIcon = adapter.games[0].icon;

export const provider = {
cleanupCredential: (accountId, cleanup) => cleanup('密码', async () => (await import('./storage/rizline-password-store')).deleteRizlinePassword(accountId)),
cleanupAccount: (account, cleanup) => cleanup('成绩缓存', async () => (await import('./services/rizline-service')).clearRizlineAccount(account.id)),
createClient: context => require('./client').createClient(context),
loginPanel: props => createElement(require('./components/rizline/RizlineLoginPanel').RizlineLoginPanel, props),
 parseCredential, credentialMatches, kind: 'provider', id: 'provider.rizline-official', providerId: 'rizline-official', gameIds: gameIds0,
title: '官方账号',
detail: '手机号验证码或账密登录',
icon: rizlineIcon,
bindingKind: 'sms-code'
} satisfies DataSourcePlugin;
