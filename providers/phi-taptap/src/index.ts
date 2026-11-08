import { createElement } from 'react';
import { parseCredential } from './credential';
import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-phigros';
import taptapIcon from './assets/taptap.webp';

export const provider = {
hydrateAccount: context => require('./hydration').hydrateAccount(context),
createResources: gameId => require('./resources').createResources(gameId),
resourcePriority: 100,
createClient: context => require('./client').createClient(context),
loginPanel: props => createElement(require('./components/phigros/PhigrosLoginPanel').PhigrosLoginPanel, props),
 parseCredential, kind: 'provider', id: 'provider.phi-taptap', providerId: 'phi-taptap', gameIds: gameIds0,
bindingKind: 'device-code',
title: 'TapTap 云存档',
detail: '扫码或前往 TapTap 授权',
icon: taptapIcon
} satisfies DataSourcePlugin;
