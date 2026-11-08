import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'arcade-finder': () => createElement(require('./pages/arcade-finder/index').default),
  'shop': () => createElement(require('./pages/arcade-finder/[shopId]').default),
} satisfies ToolPlugin['pages'];
