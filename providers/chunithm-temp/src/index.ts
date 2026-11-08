import type { DataSourcePlugin } from '@rranker/sdk';
import { adapter, gameIds } from '@rranker/game-chunithm';
const chunithmIcon = adapter.games[0].icon;

export const provider = { kind: 'provider', id: 'provider.chunithm-temp', providerId: 'chunithm-temp', gameIds, title: '临时账号', detail: '导入临时成绩', icon: chunithmIcon, bindingKind: 'local', hiddenInPicker: true } satisfies DataSourcePlugin;
