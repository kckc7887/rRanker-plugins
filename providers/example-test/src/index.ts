import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-example';
import { exampleAccountIcon } from '@rranker/plugin-assets';

export const provider = {
restoreAccounts: async (gameId) => (await import('./accounts')).restoreAccounts(gameId),
createAccount: async (gameId, accounts, assertCurrent) => (await import('./accounts')).createAccount(gameId, accounts, assertCurrent),
removeAccount: async (account, plan) => (await import('./accounts')).removeAccount(account, plan),
createClient: context => require('./client').createClient(context), kind: 'provider', id: 'provider.example-test', providerId: 'example-test', gameIds: gameIds0,
bindingKind: 'fixture',
title: '示例查分器',
detail: '示例账号',
icon: exampleAccountIcon
} satisfies DataSourcePlugin;
