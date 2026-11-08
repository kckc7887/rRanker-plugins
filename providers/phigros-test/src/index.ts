import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-phigros';
import { exampleAccountIcon } from '@rranker/plugin-assets';

export const provider = {
restoreAccounts: async () => (await import('./accounts')).restoreAccounts(),
createAccount: async (gameId, accounts, assertCurrent) => (await import('./accounts')).createAccount(gameId, accounts, assertCurrent),
removeAccount: async (account, plan) => (await import('./accounts')).removeAccount(account, plan),
createClient: context => require('./client').createClient(context), kind: 'provider', id: 'provider.phigros-test', providerId: 'phigros-test', gameIds: gameIds0,
bindingKind: 'fixture',
title: '示例查分器',
detail: '示例账号',
icon: exampleAccountIcon
} satisfies DataSourcePlugin;
