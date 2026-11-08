import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-majdata-net';
import { exampleAccountIcon } from '@rranker/plugin-assets';

export const provider = {
restoreAccounts: (gameId) => require('./accounts').restoreAccounts(gameId),
createAccount: (gameId, accounts, assertCurrent) => require('./accounts').createAccount(gameId, accounts, assertCurrent),
removeAccount: (account, plan) => require('./accounts').removeAccount(account, plan),
createClient: context => require('./client').createClient(context), kind: 'provider', id: 'provider.majdata-net-test', providerId: 'majdata-net-test', gameIds: gameIds0,
bindingKind: 'fixture',
title: '示例查分器',
detail: '示例账号',
icon: exampleAccountIcon
} satisfies DataSourcePlugin;
