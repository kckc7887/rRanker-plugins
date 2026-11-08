import { createElement } from 'react';
import { parseCredential } from './credential';
import type { DataSourcePlugin } from '@rranker/sdk';
import { adapter, gameIds as gameIds0 } from '@rranker/game-majdata-net';
const majdataIcon = adapter.games[0].icon;

export const provider = {
createResources: () => require('./client').createResources(), resourcePriority: 100,
cleanupAccount: (account, cleanup) => cleanup('成绩缓存', async () => (await import('./services/majdata-service')).clearMajdataAccount(account.id)),
createClient: context => require('./client').createClient(context),
loginPanel: props => createElement(require('./components/majdata/MajdataLoginPanel').MajdataLoginPanel, props),
 parseCredential, kind: 'provider', id: 'provider.majdata-net', providerId: 'majdata-net', gameIds: gameIds0,
title: 'Majdata Net',
detail: '账密登录',
icon: majdataIcon,
bindingKind: 'credentials'
} satisfies DataSourcePlugin;
