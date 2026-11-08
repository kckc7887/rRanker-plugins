import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'osu-mods': () => createElement(require('./pages/osu-mods').default),
} satisfies ToolPlugin['pages'];
