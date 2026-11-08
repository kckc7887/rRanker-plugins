import { createElement } from 'react';
import type { ToolPlugin } from '@rranker/sdk';

export const pages = {
  'tolerance': () => createElement(require('./pages/tolerance').default),
} satisfies ToolPlugin['pages'];
