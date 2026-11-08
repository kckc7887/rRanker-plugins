import type { DataSourcePlugin } from '@rranker/sdk';
import { adapter, gameIds as gameIds0 } from '@rranker/game-maimai';
const maimaiIcon = adapter.games[0].icon;

export const provider = {
get accountNameMaxLength() { return require('./storage/local-account-store').LOCAL_PLAYER_NAME_MAX_LENGTH; },
restoreAccounts: (gameId) => require('./accounts').restoreAccounts(gameId),
createAccount: (gameId, accounts, assertCurrent) => require('./accounts').createAccount(gameId, accounts, assertCurrent),
removeAccount: (account, plan) => require('./accounts').removeAccount(account, plan),
renameAccount: (account, displayName) => require('./accounts').renameAccount(account, displayName),
hydrateAccount: context => require('./hydration').hydrateAccount(context),
createClient: context => require('./client').createClient(context), kind: 'provider', id: 'provider.local', providerId: 'local', gameIds: gameIds0,
bindingKind: 'local',
title: '本地查分器',
detail: '可添加多个玩家',
icon: maimaiIcon
} satisfies DataSourcePlugin;
