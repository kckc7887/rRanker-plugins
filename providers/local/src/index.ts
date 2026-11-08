import type { DataSourcePlugin } from '@rranker/sdk';
import { adapter, gameIds as gameIds0 } from '@rranker/game-maimai';
const maimaiIcon = adapter.games[0].icon;

export const provider = {
get accountNameMaxLength() { return require('./storage/local-account-store').LOCAL_PLAYER_NAME_MAX_LENGTH; },
restoreAccounts: async () => (await import('./accounts')).restoreAccounts(),
createAccount: async (gameId, accounts, assertCurrent) => (await import('./accounts')).createAccount(gameId, accounts, assertCurrent),
removeAccount: async (account, plan) => (await import('./accounts')).removeAccount(account, plan),
renameAccount: async (account, displayName) => (await import('./accounts')).renameAccount(account, displayName),
hydrateAccount: async context => (await import('./hydration')).hydrateAccount(context),
createClient: context => require('./client').createClient(context), kind: 'provider', id: 'provider.local', providerId: 'local', gameIds: gameIds0,
bindingKind: 'local',
title: '本地查分器',
detail: '可添加多个玩家',
icon: maimaiIcon
} satisfies DataSourcePlugin;
