import { createElement } from 'react';
import { parseCredential, credentialMatches } from './credential';
import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-maimai';
import { gameIds as gameIds1 } from '@rranker/game-chunithm';
import lxnsIcon from './assets/lxns.webp';

export const provider = {
syncFailureNotice: (gameId, result) => require('./sync').syncFailureNotice(gameId, result),
cleanupAccount: (account, cleanup) => require('./cleanup').cleanupAccount(account, cleanup),
hydrateAccount: context => require('./hydration').hydrateAccount(context),
createResources: gameId => require('./resources').createResources(gameId),
resourcePriority: 100,
createClient: context => require('./client').createClient(context),
loginPanel: props => createElement(require('./components/LxnsLoginPanel').LxnsLoginPanel, props),
oauthCallback: () => createElement(require('./pages/oauth').default),
 parseCredential, credentialMatches, kind: 'provider', id: 'provider.lxns', providerId: 'lxns', gameIds: [...gameIds0, ...gameIds1],
bindingKind: 'oauth-code',
title: '落雪查分器',
detail: 'OAuth 授权（授权后自动返回）',
icon: lxnsIcon
} satisfies DataSourcePlugin;
