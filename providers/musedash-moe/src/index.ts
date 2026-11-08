import { createElement } from 'react';
import type { DataSourcePlugin } from '@rranker/sdk';
import { adapter, gameIds as gameIds0 } from '@rranker/game-musedash';
const museDashIcon = adapter.games[0].icon;

export const provider = {
bindingSheet: props => createElement(require('./BindingSheet').BindingSheet, props),
createResources: () => require('./client').createResources(), resourcePriority: 100,
restoreAccounts: (gameId) => require('./accounts').restoreAccounts(gameId),
removeAccount: (account, plan) => require('./accounts').removeAccount(account, plan),
createClient: context => require('./client').createClient(context), kind: 'provider', id: 'provider.musedash-moe', providerId: 'musedash-moe', gameIds: gameIds0,
bindingKind: 'public-player',
title: 'MuseDash.moe',
detail: '搜索公开玩家 · 无需登录',
icon: museDashIcon
} satisfies DataSourcePlugin;
