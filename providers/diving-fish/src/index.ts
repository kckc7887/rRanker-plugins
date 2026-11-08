import { createElement } from 'react';
import { parseCredential } from './credential';
import type { DataSourcePlugin } from '@rranker/sdk';
import { gameIds as gameIds0 } from '@rranker/game-maimai';
import divingFishIcon from './assets/diving-fish.webp';

export const provider = {
sync: context => require('./sync').sync(context),
createClient: context => require('./client').createClient(context),
loginPanel: props => createElement(require('./components/maimai/DivingFishLoginPanel').DivingFishLoginPanel, props),
 parseCredential, kind: 'provider', id: 'provider.diving-fish', providerId: 'diving-fish', gameIds: gameIds0,
bindingKind: 'credentials',
title: '水鱼查分器',
detail: '账密登录（可上传）',
icon: divingFishIcon
} satisfies DataSourcePlugin;
