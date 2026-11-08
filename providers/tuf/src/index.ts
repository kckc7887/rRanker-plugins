import { createElement } from 'react';
import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-adofai';
import tufIcon from './assets/tuf.webp';

export const provider = {
createResources: () => require('./client').createResources(), resourcePriority: 100,
bindingSheet: props => createElement(require('./BindingSheet').BindingSheet, props),
restoreAccounts: async () => (await import('./accounts')).restoreAccounts(),
removeAccount: async (account, plan) => (await import('./accounts')).removeAccount(account, plan),
hydrateAccount: async context => (await import('./hydration')).hydrateAccount(context),
createClient: context => require('./client').createClient(context), kind: 'provider', id: 'provider.tuf', providerId: 'tuf', gameIds: gameIds0,
bindingKind: 'public-player',
title: 'TUF 社区',
detail: '搜索公开玩家 · 无需登录',
icon: tufIcon
} satisfies DataSourcePlugin;
