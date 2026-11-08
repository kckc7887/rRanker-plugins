import { createElement } from 'react';
import type { DataSourcePlugin } from '@rranker/sdk';
import { adapter, gameIds as gameIds0 } from '@rranker/game-phira';
const phiraIcon = adapter.games[0].icon;

export const provider = {
createResources: () => require('./client').createResources(), resourcePriority: 100,
bindingSheet: props => createElement(require('./BindingSheet').BindingSheet, props),
restoreAccounts: async () => (await import('./accounts')).restoreAccounts(),
removeAccount: async (account, plan) => (await import('./accounts')).removeAccount(account, plan),
createClient: context => require('./client').createClient(context), kind: 'provider', id: 'provider.phira-community', providerId: 'phira-community', gameIds: gameIds0,
bindingKind: 'public-player',
title: 'Phira社区',
detail: '公开玩家 ID 或用户名 · 无需登录',
icon: phiraIcon
} satisfies DataSourcePlugin;
