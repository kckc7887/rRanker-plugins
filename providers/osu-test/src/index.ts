import { createElement } from 'react';
import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-osu';
import { exampleAccountIcon } from '@rranker/plugin-assets';

export const provider = {
bindingSheet: props => createElement(require('./BindingSheet').BindingSheet, props),
restoreAccounts: async (gameId) => (await import('./accounts')).restoreAccounts(gameId),
createAccount: async (gameId, accounts, assertCurrent) => (await import('./accounts')).createAccount(gameId, accounts, assertCurrent),
removeAccount: async (account, plan) => (await import('./accounts')).removeAccount(account, plan),
createClient: context => require('./client').createClient(context), kind: 'provider', id: 'provider.osu-test', providerId: 'osu-test', gameIds: gameIds0,
bindingKind: 'fixture',
title: '示例查分器',
detail: '示例账号',
icon: exampleAccountIcon
} satisfies DataSourcePlugin;
