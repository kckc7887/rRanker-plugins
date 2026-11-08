/* eslint-disable @typescript-eslint/no-require-imports */
import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'chart-preview': () => createElement(require('./pages/chart-preview').default),
  'osu-mods': () => createElement(require('./pages/osu-mods').default),
} satisfies ToolPlugin['pages'];
