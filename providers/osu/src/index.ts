import { createElement } from 'react';
import { parseCredential, credentialMatches } from './credential';
import type { DataSourcePlugin } from '@rranker/sdk';
import { adapter, gameIds as gameIds0 } from '@rranker/game-osu';
const osuIcon = adapter.games[0].familyIcon!;

export const provider = {
cleanupAccount: async (account, cleanup) => (await import('./cleanup')).cleanupAccount(account, cleanup),
onCredentialsReleased: () => require('./providers/osu-oauth').clearOsuRotationCache(),
createClient: context => require('./client').createClient(context),
loginPanel: props => createElement(require('./components/osu/OsuLoginPanel').OsuLoginPanel, props),
oauthCallback: () => createElement(require('./pages/oauth').default),
 parseCredential, credentialMatches, kind: 'provider', id: 'provider.osu', providerId: 'osu', gameIds: gameIds0,
bindingKind: 'oauth-code',
title: 'osu! OAuth',
detail: 'OAuth 授权（授权后选择模式绑定）',
icon: osuIcon
} satisfies DataSourcePlugin;
